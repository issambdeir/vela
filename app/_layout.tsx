
import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function Layout() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/auth');
      setChecked(true);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/auth');
      else router.replace('/');
    });
  }, []);

  if (!checked) return null;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
  );
}

