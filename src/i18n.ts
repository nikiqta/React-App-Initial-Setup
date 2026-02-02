import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import i18n from 'i18next';

i18n
  .use(Backend) // Use the backend plugin to load namespaces
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: 'fr',
    supportedLngs: ['en', 'fr'],
    ns: ['common'], // To enable direct translations in static functions
    // debug: true,
    compatibilityJSON: 'v4',
    partialBundledLanguages: true,
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Path to translation files
    },
    react: {
      useSuspense: false,
    },
  });
