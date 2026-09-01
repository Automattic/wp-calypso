import { omnibarSiteIdQuery, siteByIdQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
// eslint-disable-next-line no-restricted-imports -- constants-only module, keeps data-stores out of the main bundle
import { HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT } from '@automattic/data-stores/src/help-center/constants';
import { useQuery } from '@tanstack/react-query';
import { Suspense, lazy, useCallback, useState } from 'react';
import { useExperiment } from 'calypso/lib/explat';
import { useAuth } from '../auth';
import { useHelpCenter } from '../help-center';
import type HelpCenterApp from '../help-center/help-center-app';
import type { Site } from '@automattic/api-core';

const AsyncHelpCenterApp = lazy( () => import( '../help-center/help-center-app' ) );

type HelpCenterSite = NonNullable< React.ComponentProps< typeof HelpCenterApp >[ 'site' ] >;

// The dashboard has no `launchpad_screen` option, so the launchpad features it
// gates simply stay off.
function toHelpCenterSite( site: Site ): HelpCenterSite {
	return {
		ID: site.ID,
		name: site.name,
		URL: site.URL,
		domain: site.slug,
		plan: { product_slug: site.plan?.product_slug ?? '' },
		is_wpcom_atomic: site.is_wpcom_atomic,
		jetpack: site.jetpack,
		logo: { id: 0, sizes: [], url: site.icon?.img ?? '' },
		site_owner: site.site_owner,
		options: {
			launchpad_screen: '',
			site_intent: site.options?.site_intent ?? '',
			admin_url: site.options?.admin_url ?? '',
		},
	};
}

/**
 * The `help-center` query param is acted on by `useActionHooks` inside the
 * `HelpCenter` component itself, so the panel has to be mounted for a deep link
 * to open it. Mount on load whenever the param is present, and leave it to
 * `useActionHooks` to decide which values it recognizes.
 */
function hasHelpCenterQueryParam() {
	return new URLSearchParams( window.location.search ).has( 'help-center' );
}

/**
 * Renders the floating Help Center panel when the omnibar is enabled.
 * The masterbar's help button handles toggling via the shared help center store.
 *
 * Once the panel has been opened for the first time, the inner `HelpCenter`
 * component is kept mounted and manages its own visibility via the help center
 * store. Unmounting it on close would tear down the Zendesk Smooch iframe
 * mid-request and surface errors in the console.
 */
export default function OmnibarHelpCenter() {
	const { user } = useAuth();
	const { isShown, setShowHelpCenter } = useHelpCenter();
	const [ shouldMount, setShouldMount ] = useState( hasHelpCenterQueryParam );
	const { data: omnibarSiteId } = useQuery( omnibarSiteIdQuery() );
	const { data: site } = useQuery( {
		...siteByIdQuery( omnibarSiteId ?? 0 ),
		enabled: !! omnibarSiteId,
	} );
	const [ , getHelpChatForwardAssignment ] = useExperiment(
		HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT
	);

	const handleClose = useCallback( () => {
		setShowHelpCenter( false, undefined, true );
	}, [ setShowHelpCenter ] );

	// Latch to true the first time the panel is shown. React will re-render
	// immediately and discard this render's output.
	if ( isShown && ! shouldMount ) {
		setShouldMount( true );
	}

	// Defer the lazy chunk download until the panel is opened or deep-linked to.
	if ( ! shouldMount ) {
		return null;
	}

	return (
		<Suspense fallback={ null }>
			<AsyncHelpCenterApp
				currentUser={ user }
				handleClose={ handleClose }
				locale={ user.language }
				onboardingUrl={ config( 'wpcom_signup_url' ) }
				sectionName="dashboard"
				site={ site ? toHelpCenterSite( site ) : null }
				experimentVariations={ {
					[ HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT ]:
						getHelpChatForwardAssignment?.variationName ?? null,
				} }
			/>
		</Suspense>
	);
}
