// The SSR LoadingPlaceholder in client/document/index.jsx renders Step.Loading
// (TopBar + wordmark + progress bar) on /start, /setup, /checkout, and /marketplace
// when showStepContainerV2Loader is true. document/index.jsx is server-only, so
// its CSS imports don't reach the browser. Force-bundle the component stylesheets
// into entry-main so the wordmark and progress bar render styled from the very
// first paint, on routes whose section chunk doesn't transitively import the
// Step.Loading component subtree (notably: signup).
import '@automattic/onboarding/src/step-container-v2/components/StepContainerV2/style.scss';
import '@automattic/onboarding/src/step-container-v2/components/TopBar/style.scss';
import '@automattic/onboarding/src/step-container-v2/wireframes/Loading/style.scss';
