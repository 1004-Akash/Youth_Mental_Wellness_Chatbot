import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Bell, Shield, User, Trash2 } from "lucide-react";
import { getFirestore, collection, deleteDoc, getDocs } from "firebase/firestore";
import { getApp } from "firebase/app";

// Delete all mood and conversation data from Firestore
const handleDeleteAllData = async () => {
  if (!window.confirm("Are you sure you want to permanently delete all your mood data and conversations? This cannot be undone.")) return;
  const db = getFirestore(getApp());
  // Delete all documents in 'moods' collection
  const moodsSnap = await getDocs(collection(db, "moods"));
  for (const doc of moodsSnap.docs) {
    await deleteDoc(doc.ref);
  }
  // Delete all documents in 'conversations' collection
  const convSnap = await getDocs(collection(db, "conversations"));
  for (const doc of convSnap.docs) {
    await deleteDoc(doc.ref);
  }
  alert("All your mood data and conversations have been deleted.");
};

const Settings = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Display Name</Label>
                <p className="text-sm text-muted-foreground">How you appear in the app</p>
              </div>
                <Button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={handleDeleteAllData}
                >
                  Delete All Data
                </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Address</Label>
                <p className="text-sm text-muted-foreground">For account recovery and updates</p>
              </div>
              <Button variant="outline" size="sm">Update</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Daily Mood Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded to track your mood</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Weekly Summary</Label>
                <p className="text-sm text-muted-foreground">Receive your mood trends weekly</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Wellness Tips</Label>
                <p className="text-sm text-muted-foreground">Get helpful mental health tips</p>
              </div>
              <Switch defaultChecked />
            </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Language</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                </div>
                <select className="border rounded px-2 py-1">
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                  <option value="ta">தமிழ்</option>
                  <option value="bn">বাংলা</option>
                  <option value="mr">मराठी</option>
                </select>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Data Encryption</Label>
                <p className="text-sm text-muted-foreground">All your data is encrypted and secure</p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Anonymous Usage Analytics</Label>
                <p className="text-sm text-muted-foreground">Help improve the app (no personal data)</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Share Data for Research</Label>
                <p className="text-sm text-muted-foreground">Contribute to mental health research (optional)</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-4 h-4" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Delete All Data</Label>
                <p className="text-sm text-muted-foreground">Permanently remove all your mood data and conversations</p>
              </div>
              <Button variant="destructive" size="sm">Delete</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Delete Account</Label>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data</p>
              </div>
              <Button variant="destructive" size="sm">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;