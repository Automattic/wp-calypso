import { isEnabled } from '@automattic/calypso-config';
import { useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { USER_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import { useSite } from '../hooks/use-site';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const newsletter: Flow = {
	name: 'newsletter',
	title: 'Newsletters',
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
		}, [] );

		return [
			'intro',
			'newsletterSetup',
			'completingPurchase',
			'processing',
			'subscribers',
			'processingFake',
			...( isEnabled( 'signup/launchpad' ) ? [ 'launchpad' ] : [] ),
		] as StepPath[];
	},

	useStepNavigation( _currentStep, navigate ) {
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		const siteSlugParam = useSiteSlugParam();
		const site = useSite();

		let siteSlug: string | null = null;
		if ( siteSlugParam ) {
			siteSlug = siteSlugParam;
		} else if ( site ) {
			siteSlug = new URL( site.URL ).host;
		}

		const exitLaunchpad = async ( siteSlug: string | null ) => {
			// TODO: Handle null case for site slug
			try {
				await wpcom.req.post( `/sites/${ siteSlug }/settings`, {
					apiVersion: '1.1',
					launchpad_screen: 'off',
				} );

				window.location.replace( `/home/${ siteSlug }` );
			} catch ( err: any ) {
				// TODO: Add error handling
			}
		};

		function submit() {
			switch ( _currentStep ) {
				case 'completingPurchase':
					return navigate( 'processing' );
			}
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStep ) {
				case 'intro':
					if ( userIsLoggedIn ) {
						return navigate( 'newsletterSetup' );
					}
					return window.location.replace(
						'/start/account?redirect_to=/setup/newsletterSetup?flow=newsletter'
					);

				case 'newsletterSetup':
					return window.location.replace( '/start/newsletter/domains' );

				case 'subscribers':
					return navigate( 'processingFake' );

				case 'processingFake':
					return navigate( 'launchpad' );

				case 'launchpad':
					navigate( 'processingFake' );
					return exitLaunchpad( siteSlug );

				default:
					return navigate( 'intro' );
			}
		};

		const goToStep = ( step: StepPath | `${ StepPath }?${ string }` ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};
