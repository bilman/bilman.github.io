/* Use the existing Analytics property only on the public website. */
(() => {
  'use strict';
  const settings = document.currentScript;
  const measurementId = settings?.dataset.measurementId;
  const productionHost = settings?.dataset.productionHost;
  if (!measurementId || !productionHost || location.hostname !== productionHost) return;
  if (window.__academicAnalyticsInitialized) return;
  window.__academicAnalyticsInitialized = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { anonymize_ip: true });

  const loader = document.createElement('script');
  loader.async = true;
  loader.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
  document.head.appendChild(loader);
})();
