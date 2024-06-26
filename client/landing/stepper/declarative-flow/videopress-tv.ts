import { SiteSelect } from '@automattic/data-stores';
import { VIDEOPRESS_TV_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { useNewSiteVisibility } from 'calypso/landing/stepper/hooks/use-selected-plan';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE, SITE_STORE, USER_STORE } from '../stores';
import './internals/videopress.scss';
import ProcessingStep from './internals/steps-repository/processing-step';
import VideoPressTvTrialExists from './internals/steps-repository/videopress-tv-trial-exists';
import type { Flow, ProvidedDependencies } from './internals/types';
import type { UserSelect } from '@automattic/data-stores';

const videopressTv: Flow = {
	name: VIDEOPRESS_TV_FLOW,
	get title() {
		return translate( 'VideoPress TV' );
	},
	isSignupFlow: false,
	useSteps() {
		return [
			{
				slug: 'intro',
				asyncComponent: () => import( './internals/steps-repository/intro' ),
			},
			{ slug: 'processing', component: ProcessingStep },
			{ slug: 'trial', component: VideoPressTvTrialExists },
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		if ( document.body ) {
			// Make sure we only target videopress tv stepper for body css
			if ( ! document.body.classList.contains( 'is-videopress-tv-stepper' ) ) {
				document.body.classList.add( 'is-videopress-tv-stepper' );
			}
		}

		const name = this.name;
		const { createVideoPressTvSite, setPendingAction, setProgress } = useDispatch( ONBOARD_STORE );
		const locale = useFlowLocale();
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const _siteSlug = useSiteSlug();
		const [ isSiteCreationPending, setIsSiteCreationPending ] = useState( false );
		const { getNewSite, getNewSiteError } = useSelect(
			( select ) => select( SITE_STORE ) as SiteSelect,
			[]
		);
		const visibility = useNewSiteVisibility();

		const stepValidateUserIsLoggedIn = () => {
			if ( ! userIsLoggedIn ) {
				navigate( 'intro' );
				return false;
			}
			return true;
		};

		const addVideoPressPendingAction = () => {
			// only allow one call to this action to occur
			if ( isSiteCreationPending ) {
				return;
			}

			setIsSiteCreationPending( true );

			setPendingAction( async () => {
				setProgress( 0 );
				try {
					const result = await createVideoPressTvSite( {
						languageSlug: locale,
						visibility,
					} );

					if ( false === result ) {
						const error = getNewSiteError();
						if ( 'trial_exists' === error?.error ) {
							navigate( 'trial', { url: error.message } );
						}
					}
				} catch ( e ) {
					return;
				}
				setProgress( 0.5 );

				const newSite = getNewSite();
				if ( ! newSite || ! newSite.site_slug ) {
					return;
				}

				setProgress( 1 );

				// go to the new site, and let the "empty state" act as the remaining of onboarding.
				window.location.href = `https://${ newSite.site_slug }`;
			} );
		};

		// needs to be wrapped in a useEffect because validation can call `navigate` which needs to be called in a useEffect
		useEffect( () => {
			switch ( _currentStep ) {
				case 'intro':
					window.location.replace(
						`/start/videopress-account/user/${ locale }?variationName=${ name }&flow=${ name }&pageTitle=VideoPress.TV&redirect_to=/setup/videopress-tv/processing`
					);
					break;
				case 'processing':
					stepValidateUserIsLoggedIn();
					if ( ! _siteSlug ) {
						addVideoPressPendingAction();
					}
					break;
				case 'trial':
					break;
			}
		} );

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			return providedDependencies;
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStep ) {
				default:
					return navigate( 'intro' );
			}
		};

		const goToStep = ( step: string ) => {
			return navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default videopressTv;
