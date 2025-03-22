import { OnboardSelect } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { getSessionId } from 'calypso/landing/stepper/utils/use-session-id';
import { shouldShowLaunchpadFirst } from 'calypso/state/selectors/should-show-launchpad-first';
import type { Navigate, StepperStep } from '../../types';

interface Props {
	exitFlow: ( path: string ) => void;
	navigate: Navigate< StepperStep[] >;
}

interface PostFlowUrlProps {
	flow: string;
	siteId: string | number | null;
	siteSlug: string;
}

interface SiteProps {
	siteId: string | number | null;
	siteSlug: string | null;
}

export const useLaunchpadDecider = ( { exitFlow, navigate }: Props ) => {
	const { getIntent } = useSelect( ( select ) => select( ONBOARD_STORE ) as OnboardSelect, [] );
	const intent = getIntent();
	const site = useSite();
	// site intent is not set until we exit site setup flow so we set it here with onboarding store
	// as it is used in shouldShowLaunchpadFirst
	if ( site && site.options && site.options.site_intent === '' ) {
		site.options.site_intent = intent;
	}
	const showCustomerHome = site && shouldShowLaunchpadFirst( site );
	const sessionId = getSessionId();

	return {
		getPostFlowUrl: ( { flow, siteId, siteSlug }: PostFlowUrlProps ) => {
			if ( showCustomerHome ) {
				return `/home/${ siteSlug || siteId }`;
			}

			return addQueryArgs( `/setup/${ flow }/launchpad`, {
				siteSlug,
				siteId,
				sessionId,
				showLaunchpad: true,
			} );
		},
		postFlowNavigator: ( { siteId, siteSlug }: SiteProps ) => {
			if ( showCustomerHome ) {
				exitFlow( '/home/' + siteSlug );
				return;
			}

			navigate( `launchpad?siteSlug=${ siteSlug }&siteId=${ siteId }` );
		},
	};
};
