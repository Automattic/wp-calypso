import {
	AI_SITE_BUILDER_FLOW,
	AI_SITE_BUILDER_ONBOARDING_FLOW,
	BLOG_FLOW,
} from '@automattic/onboarding';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

type RedirectRule = {
	flow: string;
	to: string;
	shouldRedirect?: ( searchParams: URLSearchParams ) => boolean;
	replace?: boolean;
};

const AI_SITE_BUILDER_REDIRECT: RedirectRule = {
	flow: AI_SITE_BUILDER_FLOW,
	to: `/setup/${ AI_SITE_BUILDER_ONBOARDING_FLOW }`,
	shouldRedirect: ( searchParams ) =>
		! searchParams.has( 'siteId' ) && ! searchParams.has( 'siteSlug' ),
	replace: true,
};

// Flows to redirect and treat as removed throughout Calypso.
const REMOVED_TAILORED_FLOWS: RedirectRule[] = [
	{ flow: 'ai-assembler', to: '/start:lang?' },
	{ flow: BLOG_FLOW, to: '/start:lang?' },
	{ flow: 'free', to: '/start/free:lang?' },
	{ flow: 'google-transfer', to: '/setup/domain-transfer' },
	{ flow: 'link-in-bio', to: '/start:lang?' },
	{ flow: 'link-in-bio-tld', to: '/start:lang?' },
	{ flow: 'sensei', to: ':lang?/plugins/sensei-pro/' },
	{ flow: 'videopress', to: '/start:lang?' },
	{ flow: 'videopress-tv', to: '/start:lang?' },
	{ flow: 'videopress-tv-purchase', to: '/start:lang?' },
	{ flow: 'site-setup-wg', to: '/setup/site-setup' },
	{ flow: 'migration-signup', to: '/setup/site-migration' },
	{ flow: 'hosted-site-migration', to: '/setup/site-migration' },
	{ flow: 'domain-upsell', to: '/setup/domain-and-plan' },
];

const FLOW_REDIRECTS = [ AI_SITE_BUILDER_REDIRECT, ...REMOVED_TAILORED_FLOWS ];

export const isRemovedFlow = ( flowToCheck: string ) =>
	!! REMOVED_TAILORED_FLOWS.find( ( { flow } ) => flow === flowToCheck );

// Regex pattern for the optional language code in the format xx or xx-yy
const langPattern = '(?:/([a-z]{2}(?:-[a-z]{2})?))?/?$';

// Test against a location pathname and build a redirect URL
const redirectPathIfNecessary = ( pathname: string, search: string ) => {
	// Add trailing slash to pathname if not present
	const normalizedPathname = pathname.endsWith( '/' ) ? pathname : pathname + '/';
	const searchParams = new URLSearchParams( search );

	// Find the matching redirect route
	const route = FLOW_REDIRECTS.find(
		( { flow, shouldRedirect } ) =>
			normalizedPathname.startsWith( `/setup/${ flow }/` ) &&
			( shouldRedirect?.( searchParams ) ?? true )
	);

	// If no route is found we don't redirect and return false
	if ( ! route ) {
		return false;
	}

	// Find the language code in the pathname if present
	const [ , lang ] = normalizedPathname.match( langPattern ) ?? [];

	// Replace the ":lang?" placeholder in the "to" field with the matched language or empty string if not present
	const redirectUrl = route.to.replace( ':lang?', lang ? `/${ lang }` : '' );

	// Construct the final URL with search parameters if present
	const finalUrl = `${ redirectUrl }${ search }`;

	if ( route.flow === AI_SITE_BUILDER_FLOW ) {
		const legacyStep =
			normalizedPathname.slice( `/setup/${ AI_SITE_BUILDER_FLOW }/`.length ).split( '/' )[ 0 ] ||
			'initial';

		recordTracksEvent( 'calypso_ai_site_builder_legacy_redirect', {
			from_flow: AI_SITE_BUILDER_FLOW,
			to_flow: AI_SITE_BUILDER_ONBOARDING_FLOW,
			legacy_step: legacyStep,
			...( searchParams.get( 'ref' ) && { ref: searchParams.get( 'ref' ) } ),
			...( searchParams.get( 'source' ) && { source: searchParams.get( 'source' ) } ),
			has_prompt: searchParams.has( 'prompt' ),
			has_spec_id: searchParams.has( 'spec_id' ),
			has_create_garden_site: searchParams.has( 'create_garden_site' ),
			...( ( searchParams.get( 'provision_target' ) ||
				searchParams.get( 'early_provision_target' ) ) && {
				provision_target:
					searchParams.get( 'provision_target' ) || searchParams.get( 'early_provision_target' ),
			} ),
		} );
	} else {
		recordTracksEvent( 'calypso_tailored_flows_redirect', {
			redirect_from_url: location.pathname + location.search,
			redirect_to_url: finalUrl,
			referrer: document.referrer,
		} );
	}

	// Perform the actual redirection
	if ( route.replace ) {
		window.location.replace( finalUrl );
	} else {
		window.location.href = finalUrl;
	}

	return true;
};

export default redirectPathIfNecessary;
