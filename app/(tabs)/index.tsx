
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const SYMPTOMS = [
  'Headache', 'Fatigue', 'Nausea', 'Joint Pain',
  'Dizziness', 'Chest Pain', 'Shortness of Breath',
  'Back Pain', 'Stomach Ache', 'Anxiety',
  'Insomnia', 'Brain Fog',
];

export default function LogScreen() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [severity, setSeverity] = useState<number>(5);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [logged, setLogged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('');
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setCheckingAuth(false);
      if (!session) router.replace('/auth');

      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
        if (data?.full_name) setFirstName(data.full_name.split(' ')[0]);
      }
    });
  }, []);

  if (checkingAuth) return null;

  const handleLog = async () => {
    if (!selectedSymptom) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.from('symptoms').insert({
      symptom: selectedSymptom,
      severity,
      note,
      user_id: session?.user?.id ?? null,
    });

    setLoading(false);

    if (error) {
      setError('Could not save. Try again.');
    } else {
      setLogged(true);
      setTimeout(() => {
        setLogged(false);
        setSelectedSymptom(null);
        setSeverity(5);
        setNote('');
      }, 2000);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{greeting}{firstName ? `, ${firstName}` : ''}</Text>
            <Text style={styles.appName}>vela</Text>
            <Text style={styles.subtitle}>How are you feeling right now?</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileBtn}>
            <Text style={styles.profileBtnText}>
              {firstName ? firstName[0].toUpperCase() : '?'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Select a symptom</Text>
        <View style={styles.chipGrid}>
          {SYMPTOMS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, selectedSymptom === s && styles.chipSelected]}
              onPress={() => setSelectedSymptom(s)}
            >
              <Text style={[styles.chipText, selectedSymptom === s && styles.chipTextSelected]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedSymptom && (
          <View style={styles.severitySection}>
            <Text style={styles.label}>Severity — <Text style={styles.severityNum}>{severity} / 10</Text></Text>
            <View style={styles.severityRow}>
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.severityBtn, severity === n && styles.severityBtnSelected]}
                  onPress={() => setSeverity(n)}
                >
                  <Text style={[styles.severityBtnText, severity === n && styles.severityBtnTextSelected]}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {selectedSymptom && (
          <View style={styles.noteSection}>
            <Text style={styles.label}>Note <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Anything else? e.g. started after lunch"
              placeholderTextColor="#AAAAAA"
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        {selectedSymptom && (
          <TouchableOpacity
            style={[styles.logBtn, logged && styles.logBtnSuccess]}
            onPress={handleLog}
            disabled={loading || logged}
          >
            {loading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.logBtnText}>{logged ? '✓ Saved to Vela' : 'Log symptom'}</Text>
            }
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const TEAL = '#0F6E56';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAF9' },
  container: { padding: 24, paddingBottom: 60 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 24, marginTop: 8,
  },
  greeting: { fontSize: 13, color: '#AAA', marginBottom: 2 },
  appName: { fontSize: 28, fontWeight: '700', color: TEAL, letterSpacing: -0.5, marginBottom: 2 },
  subtitle: { fontSize: 15, color: '#555', fontWeight: '400' },
  profileBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
  },
  profileBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  optional: { fontWeight: '400', textTransform: 'none', color: '#AAAAAA' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1,
    borderColor: '#DDD', backgroundColor: '#FFF',
  },
  chipSelected: { backgroundColor: TEAL, borderColor: TEAL },
  chipText: { fontSize: 13, color: '#444', fontWeight: '500' },
  chipTextSelected: { color: '#FFF' },
  severitySection: { marginBottom: 24 },
  severityNum: { color: TEAL, fontWeight: '700' },
  severityRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  severityBtn: {
    width: 36, height: 36, borderRadius: 8,
    borderWidth: 1, borderColor: '#DDD',
    backgroundColor: '#FFF',
    alignItems: 'center', justifyContent: 'center',
  },
  severityBtnSelected: { backgroundColor: TEAL, borderColor: TEAL },
  severityBtnText: { fontSize: 13, color: '#555', fontWeight: '500' },
  severityBtnTextSelected: { color: '#FFF', fontWeight: '700' },
  noteSection: { marginBottom: 28 },
  input: {
    borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: 12, padding: 14,
    fontSize: 14, color: '#333',
    backgroundColor: '#FFF', minHeight: 80,
    textAlignVertical: 'top',
  },
  logBtn: {
    backgroundColor: TEAL, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  logBtnSuccess: { backgroundColor: '#2E7D5E' },
  logBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#CC3333', fontSize: 13, marginBottom: 12, textAlign: 'center' },
});