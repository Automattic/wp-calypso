import type { PlansIntent } from '@automattic/plans-grid-next';

/**
 * Used for defining the default plans intent for general WordPress.com plans UI.
 *
 * The default intent is used in various scenarios, such as:
 * - signup flows / plans page that do not require a tailored plans mix
 * - switching to the default plans through an escape hatch (button) when a tailored mix is rendered
 * - showing the default plans in the comparison grid when a tailored mix is rendered otherwise
 *
 * When experimenting with different default plans, this hook can be used to define the intent.
 * We will need an exclusion mechanism in that case (to not mix with other intents).
 */
const useDefaultWpcomPlansIntent = (): PlansIntent | undefined => {
	return 'plans-default-wpcom';
};

export default useDefaultWpcomPlansIntent;
