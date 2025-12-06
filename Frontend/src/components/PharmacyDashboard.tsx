import { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  LogOut,
  Pill,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

interface PharmacyDashboardProps {
  onLogout: () => void;
}

interface Medicine {
  _id?: string;
  id: number;
  name: string;
  price: number;
  quantity: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export function PharmacyDashboard({ onLogout }: PharmacyDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "add-stock" | "inventory"
  >("dashboard");
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    price: "",
    quantity: "",
  });
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    quantity: "",
  });

  const pharmacyId = localStorage.getItem("pharmacy_id");

  // ✅ Fetch all medicines for this pharmacy
  const fetchMedicines = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/medicine/${pharmacyId}`
      );
      const data = res.data.map((m: any, idx: number) => ({
        _id: m._id,
        id: idx + 1,
        name: m.medicine_name,
        price: m.price,
        quantity: m.stock,
        status:
          m.stock === 0
            ? "Out of Stock"
            : m.stock < 20
              ? "Low Stock"
              : "In Stock",
      }));
      setMedicines(data);
    } catch {
      toast.error("No medicines found. Add your first stock!");
    }
  };

  useEffect(() => {
    if (pharmacyId) fetchMedicines();
  }, [pharmacyId]);

  // ✅ Add new medicine manually
  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedicine.name || !newMedicine.price || !newMedicine.quantity) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/medicine/add`, {
        pharmacy_id: pharmacyId,
        medicine_name: newMedicine.name,
        brand_name: "",
        price: parseFloat(newMedicine.price),
        stock: parseInt(newMedicine.quantity),
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });

      toast.success(res.data.message);
      setNewMedicine({ name: "", price: "", quantity: "" });
      fetchMedicines(); // 🔁 refresh inventory after add
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add medicine");
    }
  };

  // ✅ Upload CSV for bulk medicines
  const handleCSVUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = document.getElementById("csvFile") as HTMLInputElement;
    if (!fileInput.files?.[0]) {
      toast.error("Please select a CSV file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("pharmacy_id", pharmacyId!); // ✅ attach pharmacy ID

    try {
      const res = await axios.post(
        `${API_URL}/api/medicine/upload_csv`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(`${res.data.count} medicines uploaded successfully!`);
      fileInput.value = ""; // clear input
      fetchMedicines(); // ✅ refresh inventory immediately
    } catch (err: any) {
      toast.error(err.response?.data?.message || "CSV upload failed");
    }
  };

  // 🟠 Edit
  const handleEdit = (medicine: Medicine) => {
    setEditingId(medicine._id || "");
    setEditForm({
      name: medicine.name,
      price: medicine.price.toString(),
      quantity: medicine.quantity.toString(),
    });
  };

  // 🟣 Save edit (PUT API)
  const handleSaveEdit = async (m: Medicine) => {
    try {
      const res = await axios.put(
        `${API_URL}/api/medicine/${pharmacyId}/${m.name}`,
        {
          price: parseFloat(editForm.price),
          stock: parseInt(editForm.quantity),
        }
      );

      toast.success(res.data.message);
      fetchMedicines(); // ✅ refresh after edit
      setEditingId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update");
    }
  };

  // 🔴 Delete
  const handleDelete = async (medicine: Medicine) => {
    try {
      await axios.delete(
        `${API_URL}/api/medicine/${pharmacyId}/${medicine.name}`
      );
      toast.success("Medicine deleted successfully!");
      fetchMedicines(); // ✅ refresh after delete
    } catch {
      toast.error("Failed to delete medicine");
    }
  };

  // 🚪 Logout
  const handleLogout = () => {
    toast.success("Logged out successfully!");
    localStorage.removeItem("pharmacy_id");
    setTimeout(onLogout, 500);
  };

  const totalMedicines = medicines.length;
  const lowStockCount = medicines.filter(
    (m) => m.status === "Low Stock" || m.status === "Out of Stock"
  ).length;
  const popularMedicines = medicines.filter((m) => m.quantity > 100).length;

  return (
    <div className="min-h-screen flex bg-emerald-50/40 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-r border-emerald-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Pill className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            MediFind
          </span>
        </div>

        <nav className="space-y-2">
          {["dashboard", "add-stock", "inventory"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "ghost"}
              className={`w-full justify-start ${activeTab === tab
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                : ""
                }`}
              onClick={() =>
                setActiveTab(tab as "dashboard" | "add-stock" | "inventory")
              }
            >
              {tab === "dashboard" && <LayoutDashboard className="h-4 w-4 mr-2" />}
              {tab === "add-stock" && <PlusCircle className="h-4 w-4 mr-2" />}
              {tab === "inventory" && <Package className="h-4 w-4 mr-2" />}
              {tab.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Button>
          ))}

          <div className="pt-4 border-t border-emerald-200 dark:border-gray-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h1 className="text-3xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Medicines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-emerald-600">
                    {totalMedicines}
                  </div>
                  <p className="text-sm text-gray-500">In your inventory</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Low Stock Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-amber-500">
                    {lowStockCount}
                  </div>
                  <p className="text-sm text-gray-500">Need attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Medicines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold text-teal-500">
                    {popularMedicines}
                  </div>
                  <p className="text-sm text-gray-500">High stock items</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Add Stock */}
        {activeTab === "add-stock" && (
          <div className="space-y-6">
            <h1 className="text-3xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Add Stock
            </h1>

            {/* Manual entry */}
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Medicine Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMedicine} className="space-y-4">
                  <Label>Medicine Name</Label>
                  <Input
                    placeholder="e.g., Paracetamol 500mg"
                    value={newMedicine.name}
                    onChange={(e) =>
                      setNewMedicine({ ...newMedicine, name: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Price (₹)</Label>
                      <Input
                        type="number"
                        value={newMedicine.price}
                        onChange={(e) =>
                          setNewMedicine({
                            ...newMedicine,
                            price: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={newMedicine.quantity}
                        onChange={(e) =>
                          setNewMedicine({
                            ...newMedicine,
                            quantity: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Medicine
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* CSV Upload */}
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Bulk Upload via CSV</CardTitle>
                <CardDescription>
                  Upload a CSV containing <code>medicine_name, brand_name, price, stock, expiry_date</code>.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCSVUpload} className="flex flex-col gap-4">
                  <Input id="csvFile" type="file" accept=".csv" />
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Upload CSV
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Inventory */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <h1 className="text-3xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              Inventory Management
            </h1>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine Name</TableHead>
                      <TableHead>Price (₹)</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicines.map((medicine) => (
                      <TableRow key={medicine.id}>
                        <TableCell>
                          {editingId === medicine._id ? (
                            <Input
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  name: e.target.value,
                                })
                              }
                            />
                          ) : (
                            medicine.name
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === medicine._id ? (
                            <Input
                              type="number"
                              value={editForm.price}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  price: e.target.value,
                                })
                              }
                            />
                          ) : (
                            <>₹{medicine.price}</>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === medicine._id ? (
                            <Input
                              type="number"
                              value={editForm.quantity}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  quantity: e.target.value,
                                })
                              }
                            />
                          ) : (
                            medicine.quantity
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              medicine.status === "In Stock"
                                ? "bg-emerald-100 text-emerald-700"
                                : medicine.status === "Low Stock"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                            }
                          >
                            {medicine.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === medicine._id ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(medicine)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingId(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(medicine)}
                              >
                                <Edit className="h-4 w-4 text-emerald-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(medicine)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
