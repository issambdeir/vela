
import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { supabase } from '../../lib/supabase';

type SymptomLog = {
  id: string;
  symptom: string;
  severity: number;
  note: string;
  logged_at: string;
};

const TEAL = '#0F6E56';

function severityColor(s: number) {
  if (s <= 3) return '#2E7D5E';
  if (s <= 6) return '#E08C00';
  return '#CC3333';
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function TimelineScreen() {
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from('symptoms')
      .select('*')
      .eq('user_id', session?.user?.id)
      .order('logged_at', { ascending: false });

    if (!error && data) setLogs(data);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.header}>
          <Text style={styles.appName}>vela</Text>
          <Text style={styles.subtitle}>Your symptom history</Text>
        </View>

        {loading && <ActivityIndicator color={TEAL} style={{ marginTop: 40 }} />}

        {!loading && logs.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No logs yet.</Text>
            <Text style={styles.emptySubtext}>Go to Log and add your first symptom.</Text>
          </View>
        )}

        {!loading && logs.map((log) => (
          <View key={log.id} style={styles.card}>
            <View style={[styles.severityBar, { backgroundColor: severityColor(log.severity) }]} />
            <View style={styles.cardContent}>
              <View style={styles.cardTop}>
                <Text style={styles.symptomName}>{log.symptom}</Text>
                <View style={[styles.severityBadge, { backgroundColor: severityColor(log.severity) }]}>
                  <Text style={styles.severityText}>{log.severity}/10</Text>
                </View>
              </View>
              {log.note ? <Text style={styles.note}>{log.note}</Text> : null}
              <Text style={styles.time}>{formatDate(log.logged_at)} · {formatTime(log.logged_at)}</Text>
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAF9' },
  container: { padding: 24, paddingBottom: 60 },
  header: { marginBottom: 24, marginTop: 8 },
  appName: { fontSize: 28, fontWeight: '700', color: TEAL, letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#555', fontWeight: '400' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#E5E5E5',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  severityBar: { width: 4 },
  cardContent: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  symptomName: { fontSize: 16, fontWeight: '600', color: '#222' },
  severityBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  severityText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  note: { fontSize: 13, color: '#666', marginBottom: 6 },
  time: { fontSize: 12, color: '#AAA' },
  empty: { marginTop: 60, alignItems: 'center' },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#888', marginBottom: 6 },
  emptySubtext: { fontSize: 13, color: '#AAA' },
});
