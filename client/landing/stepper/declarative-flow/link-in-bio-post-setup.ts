import { Onboard } from '@automattic/data-stores';
import { LINK_IN_BIO_POST_SETUP_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE } from '../stores';
import LinkInBioPostSetup from './internals/steps-repository/link-in-bio-post-setup';
import type { Flow } from './internals/types';

const linkInBioPostSetup: Flow = {
	name: LINK_IN_BIO_POST_SETUP_FLOW,
	get title() {
		return translate( 'Link in Bio' );
	},
	isSignupFlow: false,
	useSteps() {
		return [ { slug: 'linkInBioPostSetup', component: LinkInBioPostSetup } ];
	},
	useSideEffect() {
		const { setIntent } = useDispatch( ONBOARD_STORE );

		useEffect( () => {
			setIntent( Onboard.SiteIntent.LinkInBioPostSetup );
		}, [] );
	},

	useStepNavigation( currentStep ) {
		const siteSlug = useSiteSlug();

		function submit() {
			switch ( currentStep ) {
				case 'linkInBioPostSetup':
					return window.location.assign( `/setup/link-in-bio/launchpad?siteSlug=${ siteSlug }` );
			}
		}

		return { submit };
	},
};

export default linkInBioPostSetup;
