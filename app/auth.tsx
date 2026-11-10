
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import Svg, { Path, Line } from 'react-native-svg';

const TEAL = '#0F6E56';

function SailIcon({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d="M 48 82 Q 46 40 68 18 Q 76 40 76 82 Z" fill={TEAL} />
      <Path d="M 48 82 Q 47 55 36 38 Q 32 55 38 82 Z" fill={TEAL} opacity={0.4} />
      <Line x1="28" y1="82" x2="80" y2="82" stroke={TEAL} strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
}

export default function AuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.replace('/');
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else router.replace('/');
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero section */}
          <View style={styles.hero}>
            <View style={styles.iconWrapper}>
              <SailIcon size={72} />
            </View>
            <Text style={styles.appName}>vela</Text>
            <Text style={styles.tagline}>Track symptoms. Feel heard.</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {isLogin ? 'Welcome back' : 'Create your account'}
            </Text>

            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#CCC"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#CCC"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={styles.btn}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.btnText}>
                    {isLogin ? 'Log in' : 'Sign up'}
                  </Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setIsLogin(!isLogin); setError(null); }}
              style={styles.switchBtn}
            >
              <Text style={styles.switchText}>
                {isLogin
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <Text style={styles.switchTextBold}>
                  {isLogin ? 'Sign up' : 'Log in'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            Your health data stays private and secure.
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4FAF7' },
  container: {
    flexGrow: 1, padding: 24,
    justifyContent: 'center', paddingBottom: 40,
  },
  hero: { alignItems: 'center', marginBottom: 36 },
  iconWrapper: {
    width: 96, height: 96,
    borderRadius: 24,
    backgroundColor: '#E1F5EE',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 36, fontWeight: '700',
    color: TEAL, letterSpacing: -1, marginBottom: 6,
  },
  tagline: { fontSize: 15, color: '#888', fontWeight: '400' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20, padding: 24,
    borderWidth: 0.5, borderColor: '#E5E5E5',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20, fontWeight: '700',
    color: '#222', marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13, fontWeight: '500',
    color: '#555', marginBottom: 6,
  },
  input: {
    borderWidth: 1, borderColor: '#E8E8E8',
    borderRadius: 12, padding: 14,
    fontSize: 15, color: '#333',
    backgroundColor: '#FAFAFA', marginBottom: 14,
  },
  btn: {
    backgroundColor: TEAL, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    marginTop: 4,
  },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#CC3333', fontSize: 13, marginBottom: 12 },
  switchBtn: { marginTop: 16, alignItems: 'center' },
  switchText: { fontSize: 14, color: '#888' },
  switchTextBold: { color: TEAL, fontWeight: '600' },
  footer: {
    fontSize: 12, color: '#BBB',
    textAlign: 'center',
  },
});