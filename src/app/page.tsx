"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { proxyRequest } from "@/lib/proxy";

export default function Home() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [isOn, setIsOn] = useState(false);

  function toast({ title, description, variant = "success" }: { title: string, description?: string, variant?: "success" | "destructive" }) {
    console.log(`[Toast] ${title}: ${description}`);
  }

  // Load saved credentials on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("quinzsps-user");
    const savedIpAddress = localStorage.getItem("quinzsps-ip");

    if (savedUser) setUser(savedUser);
    if (savedIpAddress) setIpAddress(savedIpAddress);
  }, []);

  const fetchToken = async () => {
    setLoading(true);
    try {
      const loginBody = [
        {
          id: 0,
          jsonrpc: "2.0",
          method: "Api.Login",
          params: { user: user, password: password }
        }
      ];

      const data = await proxyRequest(`https://${ipAddress}/api/jsonrpc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginBody),
      });

      const newToken = data[0]?.result?.token;

      if (newToken) {
        setToken(newToken);
        // Save credentials for next time
        localStorage.setItem("quinzsps-user", user);
        localStorage.setItem("quinzsps-ip", ipAddress);

        toast({
          title: "Login successful",
          description: "You can now control the device",
        });
      } else {
        toast({
          title: "Login failed",
          description: "Invalid credentials or server error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Connection error",
        description: "Could not connect to the server. Check the IP address and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const writeSpeed = async (newSpeed: number) => {
    if (!token) return;

    try {
      const writeSpeedBody = [
        {
          "jsonrpc": "2.0",
          "method": "PlcProgram.Write",
          "id": 1,
          "params": {
            "var": "\"Motor\".Sollgeschwindigkeit",
            "value": newSpeed
          }
        }
      ]

      const response = await proxyRequest(`https://${ipAddress}/api/jsonrpc`, {
        method: "POST",
        headers: {
          "X-Auth-Token": token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(writeSpeedBody),
      });

      if (response) {
        toast({
          title: "Speed updated",
          description: `Speed set to ${newSpeed}`,
        });
      }
    } catch (error) {
      console.error("Speed change error:", error);
      toast({
        title: "Error",
        description: "Failed to update speed",
        variant: "destructive",
      });
    }
  };

  const writeOnOff = async (on: boolean) => {
    if (!token) return;

    try {
      const writeOnOffBody = [
        {
          "jsonrpc": "2.0",
          "method": "PlcProgram.Write",
          "id": 1,
          "params": {
            "var": "\"Motor\".ein",
            "value": on
          }
        }
      ]

      const response = await proxyRequest(`https://${ipAddress}/api/jsonrpc`, {
        method: "POST",
        headers: {
          "X-Auth-Token": token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(writeOnOffBody),
      });

      if (response) {
        setIsOn(on);
        toast({
          title: on ? "Device turned ON" : "Device turned OFF",
        });
      }
    } catch (error) {
      console.error("On/Off error:", error);
      toast({
        title: "Error",
        description: "Failed to change power state",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md">
        {!token ? (
          <Card>
            <CardHeader>
              <CardTitle>SPS Control Panel</CardTitle>
              <CardDescription>Enter your credentials to access the control system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ipAddress">IP Address</Label>
                <Input
                  id="ipAddress"
                  placeholder="e.g. 192.168.10.61"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={fetchToken}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : "Login"}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>SPS Controls</CardTitle>
              <CardDescription>Connected to {ipAddress}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="power">Power</Label>
                  <Switch
                    id="power"
                    checked={isOn}
                    onCheckedChange={(checked) => writeOnOff(checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {isOn ? "Device is running" : "Device is off"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="speed">Speed: {speed}</Label>
                <Slider
                  id="speed"
                  min={0}
                  max={3000}
                  step={100}
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                  onValueCommit={(value) => writeSpeed(value[0])}
                  disabled={!isOn}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={logout}>Logout</Button>
              <Button
                variant="destructive"
                onClick={() => writeOnOff(false)}
                disabled={!isOn}
              >
                Emergency Stop
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </main>
  );
}