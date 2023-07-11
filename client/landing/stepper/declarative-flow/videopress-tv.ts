import { SiteSelect } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, VIDEOPRESS_TV_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useNewSiteVisibility } from 'calypso/landing/stepper/hooks/use-selected-plan';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE, SITE_STORE, USER_STORE } from '../stores';
import './internals/videopress.scss';
import ProcessingStep from './internals/steps-repository/processing-step';
import type { Flow, ProvidedDependencies } from './internals/types';
import type { UserSelect } from '@automattic/data-stores';

const videopressTv: Flow = {
	name: VIDEOPRESS_TV_FLOW,
	get title() {
		return translate( 'VideoPress TV' );
	},
	useSteps() {
		return [
			{
				slug: 'intro',
				asyncComponent: () => import( './internals/steps-repository/intro' ),
			},
			{ slug: 'processing', component: ProcessingStep },
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
		const { createVideoPressTvSite, setPendingAction, setProgress, setStepProgress } =
			useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName: name } );
		const locale = useLocale();
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const _siteSlug = useSiteSlug();
		const [ isSiteCreationPending, setIsSiteCreationPending ] = useState( false );
		const { getNewSite } = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );
		const visibility = useNewSiteVisibility();

		setStepProgress( flowProgress );

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
					await createVideoPressTvSite( {
						languageSlug: locale,
						visibility,
					} );
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
					break;
				case 'processing':
					stepValidateUserIsLoggedIn();
					if ( ! _siteSlug ) {
						addVideoPressPendingAction();
					}
					break;
			}
		} );

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( _currentStep ) {
				case 'intro':
					if ( userIsLoggedIn ) {
						return navigate( 'processing' );
					}

					return window.location.replace(
						`/start/videopress-account/user/${ locale }?variationName=${ name }&flow=${ name }&pageTitle=VideoPress.TV&redirect_to=/setup/videopress-tv/processing`
					);
			}
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
