import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites } from 'calypso/my-sites/controller';
import { setupSite } from './setup-site/controller';
import { STEP_SLUGS } from './setup-site/types';

export default function (): void {
	// Forgot to specify a site, show a UI to select one
	page( '/setup', sites, makeLayout, clientRender );

	// The `?` makes the step slug optional, that way if it's missing the
	// "intent" step will be rendered.
	const siteSetupStepSlugs = `:stepSlug(${ STEP_SLUGS.join( '|' ) })?`;

	page(
		`/setup/${ siteSetupStepSlugs }/:siteId`,
		siteSelection,
		setupSite, // Create <SetupSite> component in `context.primary`
		makeLayout,
		clientRender
	);
}
