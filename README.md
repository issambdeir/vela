# Vela

A React Native (Expo) symptom-tracking app that helps people log how they're feeling over
time and turn that log into a clean report they can bring to a doctor's visit.

## Features

- **Log symptoms** — pick from a set of common symptoms, rate severity, and add a note,
  all in a quick daily-log screen.
- **Timeline** — see your full symptom history at a glance, color-coded by severity.
- **PDF reports** — generate a formatted PDF summary of your symptom history to share with
  a healthcare provider, using `expo-print` and `expo-sharing`.
- **Accounts** — email-based authentication and profile storage via Supabase.
- **Subscriptions** — report generation is gated behind a subscription, handled with
  RevenueCat (`react-native-purchases`).

## Tech stack

- [Expo](https://expo.dev) / React Native, with [expo-router](https://docs.expo.dev/router/introduction/) for file-based navigation
- [Supabase](https://supabase.com) for auth and data storage
- [RevenueCat](https://www.revenuecat.com) for subscription management
- TypeScript

## Running it

```bash
npm install
npx expo start
```

Then open the app in a development build, iOS Simulator, Android emulator, or Expo Go.
