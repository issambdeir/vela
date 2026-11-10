
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

const TEAL = '#0F6E56';

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setEmail(session.user.email ?? '');

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (data) {
      setUsername(data.username ?? '');
      setFullName(data.full_name ?? '');
      setGender(data.gender ?? '');
      setAge(data.age?.toString() ?? '');
      setWeight(data.weight_kg?.toString() ?? '');
      setHeight(data.height_cm?.toString() ?? '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      username,
      full_name: fullName,
      gender,
      age: age ? parseInt(age) : null,
      weight_kg: weight ? parseFloat(weight) : null,
      height_cm: height ? parseFloat(height) : null,
    });

    setSaving(false);

    if (error) {
      setError('Could not save profile. Try again.');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.appName}>vela</Text>
          <Text style={styles.subtitle}>Your profile</Text>
        </View>

        {email ? (
          <View style={styles.emailCard}>
            <Text style={styles.emailLabel}>Signed in as</Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>
        ) : null}

        {loading ? <ActivityIndicator color={TEAL} style={{ marginTop: 20 }} /> : (
          <>
            <Text style={styles.sectionLabel}>Account</Text>

            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. issam_92"
              placeholderTextColor="#AAA"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <Text style={styles.sectionLabel}>Personal info</Text>

            <Text style={styles.fieldLabel}>Full name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Issam Abdeir"
              placeholderTextColor="#AAA"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.fieldLabel}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 20"
              placeholderTextColor="#AAA"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
            />

            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.chipGrid}>
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, gender === g && styles.chipSelected]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.chipText, gender === g && styles.chipTextSelected]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Body measurements</Text>

            <Text style={styles.fieldLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 70"
              placeholderTextColor="#AAA"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
            />

            <Text style={styles.fieldLabel}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 175"
              placeholderTextColor="#AAA"
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.saveBtn, saved && styles.saveBtnSuccess]}
              onPress={handleSave}
              disabled={saving || saved}
            >
              {saving
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.saveBtnText}>{saved ? '✓ Saved' : 'Save profile'}</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign out</Text>
            </TouchableOpacity>

          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAF9' },
  container: { padding: 24, paddingBottom: 60 },
  back: { marginBottom: 16 },
  backText: { fontSize: 14, color: TEAL, fontWeight: '500' },
  header: { marginBottom: 20, marginTop: 4 },
  appName: { fontSize: 28, fontWeight: '700', color: TEAL, letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#555' },
  emailCard: {
    backgroundColor: '#F0FAF6', borderRadius: 12,
    padding: 12, marginBottom: 20,
  },
  emailLabel: { fontSize: 11, color: '#888', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
  emailText: { fontSize: 14, color: TEAL, fontWeight: '500' },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', color: '#AAA',
    textTransform: 'uppercase', letterSpacing: 0.6,
    marginBottom: 12, marginTop: 24,
  },
  fieldLabel: { fontSize: 13, fontWeight: '500', color: '#555', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: 12, padding: 14,
    fontSize: 15, color: '#333',
    backgroundColor: '#FFF', marginBottom: 14,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 999, borderWidth: 1,
    borderColor: '#DDD', backgroundColor: '#FFF',
  },
  chipSelected: { backgroundColor: TEAL, borderColor: TEAL },
  chipText: { fontSize: 13, color: '#444', fontWeight: '500' },
  chipTextSelected: { color: '#FFF' },
  saveBtn: {
    backgroundColor: TEAL, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 24,
  },
  saveBtnSuccess: { backgroundColor: '#2E7D5E' },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#CC3333', fontSize: 13, marginTop: 8 },
  signOutBtn: {
    marginTop: 12, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#EEE',
  },
  signOutText: { fontSize: 15, color: '#CC3333', fontWeight: '500' },
});