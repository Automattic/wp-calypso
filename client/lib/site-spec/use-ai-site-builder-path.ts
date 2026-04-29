import { useExperiment } from 'calypso/lib/explat';
import { VEGA_EXPERIMENT_NAME } from './vega';

const SITE_SPEC_PATH = '/setup/ai-site-builder-spec';
const DEFAULT_PATH = '/setup/ai-site-builder';

/**
 * Returns the setup path for the "Create with AI" entry points on the
 * WordPress.com sites dashboard (new dashboard, site-switcher, empty state,
 * legacy /sites popover).
 *
 * Users enrolled as treatment in the Vega site-spec experiment get the
 * Calypso-hosted spec-refinement widget (`/setup/ai-site-builder-spec`); every
 * other case (control, loading, or fetch failure) falls back to the default
 * AI Builder flow (`/setup/ai-site-builder`).
 *
 * CIAB/garden entry points intentionally do not use this hook — their "New
 * store" actions are wired to the CIAB-tuned spec config directly in
 * `client/dashboard/sites-ciab`, and the site-spec step excludes CIAB from
 * experiment enrolment via the `?source=ciab-*` query arg.
 */
export function useAiSiteBuilderPath(): string {
	const [ , assignment ] = useExperiment( VEGA_EXPERIMENT_NAME );
	return assignment?.variationName === 'treatment' ? SITE_SPEC_PATH : DEFAULT_PATH;
}
