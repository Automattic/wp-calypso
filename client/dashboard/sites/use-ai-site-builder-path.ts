import { useExperiment } from 'calypso/lib/explat';

// Keep in sync with `VEGA_EXPERIMENT_NAME` in `client/lib/site-spec/vega.ts`.
// The dashboard tree cannot import from `calypso/lib/site-spec`, so the
// experiment name is inlined here following the same convention as the other
// dashboard-scoped experiments (see e.g. `site-launch-button/index.tsx`).
const EXPERIMENT_NAME = 'wpcom_ai_website_builder_vega_site_spec_202604';
const SITE_SPEC_PATH = '/setup/ai-site-builder-spec';
const DEFAULT_PATH = '/setup/ai-site-builder';

/**
 * Returns the setup path for the "Create with AI" entry on the WordPress.com
 * sites dashboard.
 *
 * Users enrolled as treatment in the Vega site-spec experiment get the
 * Calypso-hosted spec-refinement widget (`/setup/ai-site-builder-spec`); every
 * other case (control, loading, or fetch failure) falls back to the default
 * AI Builder flow (`/setup/ai-site-builder`).
 *
 * CIAB/garden dashboards intentionally do not use this hook — their "New
 * store" entries are wired to the CIAB-tuned spec config directly in
 * `client/dashboard/sites-ciab`.
 */
export function useAiSiteBuilderPath(): string {
	const [ , assignment ] = useExperiment( EXPERIMENT_NAME );
	return assignment?.variationName === 'treatment' ? SITE_SPEC_PATH : DEFAULT_PATH;
}
