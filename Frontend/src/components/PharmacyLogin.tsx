import { useState } from "react";
import { Building2, Mail, Lock, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner@2.0.3";
import axios from "axios";
import API_URL from "../config";

interface PharmacyLoginProps {
  onLogin: () => void;
}

export function PharmacyLogin({ onLogin }: PharmacyLoginProps) {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);

  // 🟢 Handle Login
  // 🟢 Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/pharmacy/login`, {
        email: loginForm.email,
        password: loginForm.password,
      });

      if (res.status === 200) {
        toast.success("Login successful!");
        localStorage.setItem("pharmacy_id", res.data.pharmacy_id);
        setTimeout(onLogin, 500); // 👈 Redirect to dashboard
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password, phone, address, latitude, longitude } = registerForm;

    if (!name || !email || !password || !phone || !address || !latitude || !longitude) {
      toast.error("Please fill in all fields, including coordinates");
      return;
    }

    try {
      setLoading(true);
      const coordinates = [parseFloat(longitude), parseFloat(latitude)];

      const res = await axios.post(`${API_URL}/api/pharmacy/register`, {
        pharmacy_id: "P" + Date.now(),
        name,
        owner_name: name,
        email,
        password,
        phone_number: phone,
        address: {
          street: address,
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560001",
        },
        coordinates,
      });

      if (res.status === 201) {
        toast.success("Registration successful! Redirecting to dashboard...");

        // 👇 Save pharmacy_id and redirect directly
        localStorage.setItem("pharmacy_id", res.data.pharmacy.pharmacy_id);
        setTimeout(onLogin, 1000); // redirect to dashboard
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side */}
        <div className="hidden lg:flex flex-col items-center justify-center p-8">
          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl mb-6 animate-pulse">
            <Building2 className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent text-center">
            MediFind for Pharmacies
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">
            Manage your inventory, connect with patients, and grow your pharmacy business.
          </p>
        </div>

        {/* Right Side */}
        <Card className="border-emerald-200 dark:border-gray-700 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Pharmacy Portal
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Login or register to manage your pharmacy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* 🟩 LOGIN TAB */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="pharmacy@example.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                  >
                    {loading ? "Logging in..." : "Login to Dashboard"}
                  </Button>
                </form>
              </TabsContent>

              {/* 🟩 REGISTER TAB */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pharmacy Name</Label>
                    <Input
                      type="text"
                      placeholder="HealthPlus Pharmacy"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="pharmacy@example.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contact Number</Label>
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input
                      type="text"
                      placeholder="123 Main Street, City"
                      value={registerForm.address}
                      onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                    />
                  </div>

                  {/* 🆕 Latitude & Longitude Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Latitude</Label>
                      <Input
                        type="number"
                        step="any"
                        placeholder="12.9716"
                        value={registerForm.latitude}
                        onChange={(e) => setRegisterForm({ ...registerForm, latitude: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Longitude</Label>
                      <Input
                        type="number"
                        step="any"
                        placeholder="77.5946"
                        value={registerForm.longitude}
                        onChange={(e) => setRegisterForm({ ...registerForm, longitude: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                  >
                    {loading ? "Registering..." : "Register Pharmacy"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
