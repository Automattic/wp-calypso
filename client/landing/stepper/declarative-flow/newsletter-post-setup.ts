import { Onboard } from '@automattic/data-stores';
import { NEWSLETTER_POST_SETUP_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE } from '../stores';
import NewsletterPostSetup from './internals/steps-repository/newsletter-post-setup';
import { ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';

const newsletterPostSetup: Flow = {
	name: NEWSLETTER_POST_SETUP_FLOW,
	get title() {
		return translate( 'Newsletter' );
	},
	isSignupFlow: false,
	useSteps() {
		return [ { slug: 'newsletterPostSetup', component: NewsletterPostSetup } ];
	},
	useSideEffect() {
		const { setIntent } = useDispatch( ONBOARD_STORE );

		useEffect( () => {
			setIntent( Onboard.SiteIntent.NewsletterPostSetup );
		}, [] );
	},
	useStepNavigation( currentStep, navigate ) {
		const siteSlug = useSiteSlug();

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( currentStep ) {
				case 'newsletterPostSetup':
					return window.location.assign(
						`/setup/newsletter/launchpad?siteSlug=${ siteSlug }&color=${ providedDependencies.color }`
					);
			}
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			return;
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default newsletterPostSetup;
