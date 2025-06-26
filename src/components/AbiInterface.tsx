import { useEffect, useState } from 'react';
import { ethers, parseUnits } from 'ethers';
import { BrowserProvider } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import { Loader2, Wallet, FileText, Eye, Edit3, Copy, ExternalLink } from 'lucide-react';
import { useToast } from './hooks/use-toast';

interface AbiInput {
    name: string;
    type: string;
}

interface AbiFunction {
    name: string;
    type: string;
    stateMutability: string;
    inputs: AbiInput[];
}

export default function AbiInterface() {
    const [abi, setAbi] = useState<string>('');
    const [parsedAbi, setParsedAbi] = useState<AbiFunction[]>([]);
    const [contractAddress, setContractAddress] = useState<string>('');
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [inputs, setInputs] = useState<Record<string, Record<string, string>>>({});
    const [results, setResults] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [txHash, setTxHash] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [decimals, setDecimals] = useState<number>(18);
    const { toast } = useToast();

    const handleAbiUpload = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const abiString = e.target.value;
        setAbi(abiString);

        if (!abiString.trim()) {
            setParsedAbi([]);
            setError('');
            return;
        }

        try {
            const parsed = JSON.parse(abiString);
            setParsedAbi(parsed);
            setInputs({});
            setResults({});
            setError('');
            toast({
                title: "ABI Loaded Successfully",
                description: `Found ${parsed.filter((fn: AbiFunction) => fn.type === 'function').length} functions`,
            });
        } catch (err) {
            setError('Invalid ABI format. Please ensure it\'s valid JSON.');
            setParsedAbi([]);
        }
    };

    const connectWallet = async () => {
        try {
            if (!(window as any).ethereum) {
                setError('Please install MetaMask to connect your wallet');
                return;
            }

            const ethProvider = new BrowserProvider((window as any).ethereum);
            await ethProvider.send("eth_requestAccounts", []);
            const ethSigner = await ethProvider.getSigner();
            const address = await ethSigner.getAddress();

            setProvider(ethProvider);
            setSigner(ethSigner);
            setWalletAddress(address);
            setError('');

            toast({
                title: "Wallet Connected",
                description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
            });
        } catch (err: any) {
            setError('Failed to connect wallet: ' + err.message);
        }
    };

    const handleInputChange = (fnName: string, inputName: string, value: string) => {

        setInputs((prev) => ({
            ...prev,
            [fnName]: { ...prev[fnName], [inputName]: value }
        }));
    };

    const executeReadFunction = async (fn: AbiFunction) => {
        if (!contractAddress || !(signer || provider)) {
            setError("Please enter contract address and connect wallet");
            return;
        }

        setLoading((prev) => ({ ...prev, [fn.name]: true }));
        setError("");

        try {
            console.log("🚀 [executeReadFunction] Contract Address:", contractAddress);
            console.log("📜 [executeReadFunction] ABI Function:", fn.name);
            console.log("🧩 [executeReadFunction] Inputs:", fn.inputs);

            const contractInstance = new ethers.Contract(
                contractAddress,
                parsedAbi,
                signer ?? provider // Use signer if available
            );

            console.log("🔗 [executeReadFunction] Contract Instance:", contractInstance);

            // const args = fn.inputs.map((inp) => inputs[fn.name]?.[inp.name] || "");

            const args = fn.inputs.map((inp) => {
                const val = inputs[fn.name]?.[inp.name] || '';

                // Auto-convert to smallest unit if amount-related
                if (inp.type === 'uint256' && /amount|value|supply/i.test(inp.name)) {
                    try {
                        return ethers.parseUnits(val, decimals); // convert to smallest unit
                    } catch {
                        return val;
                    }
                }

                return val;
            });

            // const result = await contractInstance[fn.name](...args);

            const method = contractInstance[fn.name];
            if (typeof method === "function") {
                const result = await method(...args);
                // optionally: handle `tx.wait()` if it’s a write function
                setResults((prev) => ({
                    ...prev,
                    [fn.name]: result?.toString?.() ?? JSON.stringify(result),
                }));

                toast({
                    title: "Function Called Successfully",
                    description: `${fn.name} executed`,
                });
            } else {
                setError(`Function ${fn.name} is not defined on contract`);
            }


        } catch (err: any) {
            console.error("❌ [executeReadFunction] Error:", err);
            setError(`Error calling ${fn.name}: ${err.message}`);
        } finally {
            setLoading((prev) => ({ ...prev, [fn.name]: false }));
        }
    };

    const executeWriteFunction = async (fn: AbiFunction) => {
        if (!contractAddress || !signer) {
            setError('Please enter contract address and connect wallet');
            return;
        }

        setLoading(prev => ({ ...prev, [fn.name]: true }));
        setError('');

        try {
            const contractInstance = new ethers.Contract(contractAddress, parsedAbi, signer);
            // const args = fn.inputs.map((inp) => inputs[fn.name]?.[inp.name] || '');
            const args = fn.inputs.map((inp) => {
                const value = inputs[fn.name]?.[inp.name]
                if (['amount', '_value','_initialSupply'].includes(inp.name) && Number(value) && decimals) {
                    return parseUnits(String(value), decimals)
                }
                return value
            });

            const method = contractInstance[fn.name];
            if (typeof method === "function") {
                const tx = await method(...args);
                setTxHash(tx.hash);

                toast({
                    title: "Transaction Sent",
                    description: "Waiting for confirmation...",
                });

                await tx.wait();

                toast({
                    title: "Transaction Confirmed",
                    description: `${fn.name} executed successfully`,
                });
            } else {
                setError(`Function ${fn.name} is not defined on contract`);
            }


        } catch (err: any) {
            console.error(err);
            setError(`Error executing ${fn.name}: ${err.message}`);
        } finally {
            setLoading(prev => ({ ...prev, [fn.name]: false }));
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied",
            description: "Copied to clipboard",
        });
    };

    useEffect(() => {
        const fetchDecimals = async () => {
            if (!contractAddress || parsedAbi.length === 0 || !(signer || provider)) return;

            try {
                const contract = new ethers.Contract(contractAddress, parsedAbi, signer ?? provider);
                const _decimals = await contract.decimals?.();
                if (_decimals !== undefined) {
                    setDecimals(Number(_decimals));
                }
            } catch (e) {
                console.warn("Could not fetch decimals:", e);
                setDecimals(18); // fallback
            }
        };

        fetchDecimals();
    }, [contractAddress, parsedAbi, signer, provider]);

    const viewFunctions = parsedAbi.filter((fn) => fn.type === 'function' && (fn.stateMutability === 'view' || fn.stateMutability === 'pure'));
    const writeFunctions = parsedAbi.filter((fn) => fn.type === 'function' && fn.stateMutability !== 'view' && fn.stateMutability !== 'pure');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900">Interact ABI Tool</h1>
                    <p className="text-lg text-gray-600">Interact with EVM smart contracts using their ABI</p>
                </div>

                {/* Connection Status */}
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Wallet Connection
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <Button
                                onClick={connectWallet}
                                variant={walletAddress ? "secondary" : "default"}
                                className="flex items-center gap-2"
                            >
                                <Wallet className="h-4 w-4" />
                                {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
                            </Button>
                            {walletAddress && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    Connected
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* ABI Input */}
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Contract ABI
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="Paste your contract ABI JSON here..."
                            className="min-h-[120px] font-mono text-sm"
                            onChange={handleAbiUpload}
                            value={abi}
                        />
                        <Input
                            type="text"
                            placeholder="Enter contract address (0x...)"
                            value={contractAddress}
                            onChange={(e) => setContractAddress(e.target.value)}
                            className="font-mono"
                        />
                        {parsedAbi.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                                <Badge variant="secondary">{parsedAbi.filter(fn => fn.type === 'function').length} Functions</Badge>
                                <Badge variant="outline">{viewFunctions.length} Read</Badge>
                                <Badge variant="outline">{writeFunctions.length} Write</Badge>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Error Display */}
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Transaction Hash */}
                {txHash && (
                    <Alert>
                        <AlertDescription className="flex items-center gap-2">
                            <span>Transaction Hash: </span>
                            <code className="font-mono text-sm bg-muted px-2 py-1 rounded">{txHash.slice(0, 10)}...{txHash.slice(-8)}</code>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(txHash)}
                                className="h-6 w-6 p-0"
                            >
                                <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, '_blank')}
                                className="h-6 w-6 p-0"
                            >
                                <ExternalLink className="h-3 w-3" />
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Read Functions */}
                    {viewFunctions.length > 0 && (
                        <Card className="border-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-700">
                                    <Eye className="h-5 w-5" />
                                    Read Functions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {viewFunctions.map((fn) => (
                                    <div key={fn.name} className="border rounded-lg p-4 space-y-3 bg-blue-50/50">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-blue-900">{fn.name}</h4>
                                            <Badge variant="secondary">read</Badge>
                                        </div>

                                        {fn.inputs.map((input, idx) => (
                                            <div key={idx} className="space-y-1">
                                                <label className="text-sm font-medium text-gray-700">
                                                    {input.name} ({input.type})
                                                </label>
                                                <Input
                                                    placeholder={`Enter ${input.name}...`}
                                                    onChange={(e) => handleInputChange(fn.name, input.name, e.target.value)}
                                                    value={inputs[fn.name]?.[input.name] || ''}
                                                />

                                                {/*  <Input
                                                    placeholder={`Enter ${input.name}...`}
                                                    onChange={(e) => handleInputChange(fn.name, input.name, e.target.value)}
                                                    value={inputs[fn.name]?.[input.name] || ''}
                                                />*/}
                                            </div>
                                        ))}

                                        <Button
                                            onClick={() => executeReadFunction(fn)}
                                            disabled={loading[fn.name] || !contractAddress || !provider}
                                            className="w-full"
                                            variant="outline"
                                        >
                                            {loading[fn.name] ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Calling...
                                                </>
                                            ) : (
                                                'Call Function'
                                            )}
                                        </Button>

                                        {results[fn.name] && (
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-700">Result:</label>
                                                <div className="bg-white border rounded p-3 font-mono text-sm break-all">
                                                    {results[fn.name]}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Write Functions */}
                    {writeFunctions.length > 0 && (
                        <Card className="border-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-700">
                                    <Edit3 className="h-5 w-5" />
                                    Write Functions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {writeFunctions.map((fn) => (
                                    <div key={fn.name} className="border rounded-lg p-4 space-y-3 bg-green-50/50">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-green-900">{fn.name}</h4>
                                            <Badge variant="secondary">write</Badge>
                                        </div>

                                        {fn.inputs.map((input, idx) => (
                                            <div key={idx} className="space-y-1">
                                                <label className="text-sm font-medium text-gray-700">
                                                    {input.name} ({input.type})
                                                </label>
                                                <Input
                                                    placeholder={`Enter ${input.name}...`}
                                                    onChange={(e) => handleInputChange(fn.name, input.name, e.target.value)}
                                                    value={inputs[fn.name]?.[input.name] || ''}
                                                />
                                            </div>
                                        ))}

                                        <Button
                                            onClick={() => executeWriteFunction(fn)}
                                            disabled={loading[fn.name] || !contractAddress || !signer}
                                            className="w-full bg-green-600 hover:bg-green-700"
                                        >
                                            {loading[fn.name] ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                'Send Transaction'
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Getting Started */}
                {parsedAbi.length === 0 && (
                    <Card className="border-2 border-dashed">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <FileText className="h-12 w-12 mx-auto text-gray-400" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Get Started</h3>
                                    <p className="text-gray-600">Paste your contract ABI and address above to begin interacting with your smart contract.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}