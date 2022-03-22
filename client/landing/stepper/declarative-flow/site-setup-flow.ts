import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { useSelect } from '@wordpress/data';
import { reduce, snakeCase } from 'lodash';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useFSEStatus } from '../hooks/use-fse-status';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { ONBOARD_STORE } from '../stores';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

function redirect( to: string ) {
	window.location.href = to;
}

export const siteSetupFlow: Flow = {
	name: 'site-setup',

	useSteps() {
		return [
			'intent',
			'options',
			'designSetup',
			'bloggerStartingPoint',
			'courses',
			'storeFeatures',
		];
	},

	useStepNavigation( currentStep, navigate ) {
		const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
		const startingPoint = useSelect( ( select ) => select( ONBOARD_STORE ).getStartingPoint() );
		const siteSlug = useSiteSlugParam();
		const { FSEActive } = useFSEStatus();

		function submit( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) {
			recordSubmitStep( providedDependencies );

			switch ( currentStep ) {
				case 'options': {
					if ( intent === 'sell' ) {
						return navigate( 'storeFeatures' );
					}
					return navigate( 'bloggerStartingPoint' );
				}

				case 'designSetup': {
					// If the user skips starting point, redirect them to My Home
					if ( intent === 'write' && startingPoint !== 'skip-to-my-home' ) {
						if ( startingPoint !== 'write' ) {
							window.sessionStorage.setItem( 'wpcom_signup_complete_show_draft_post_modal', '1' );
						}

						return redirect( `/post/${ siteSlug }` );
					}

					if ( FSEActive && intent !== 'write' ) {
						return redirect( `/site-editor/${ siteSlug }` );
					}

					return redirect( `/home/${ siteSlug }` );
				}

				case 'bloggerStartingPoint': {
					const intent = params[ 0 ];
					switch ( intent ) {
						case 'firstPost': {
							return redirect( `https://wordpress.com/post/${ siteSlug }` );
						}
						case 'courses': {
							return navigate( 'courses' );
						}
						default: {
							return navigate( intent as StepPath );
						}
					}
				}

				case 'intent': {
					const submittedIntent = params[ 0 ];
					switch ( submittedIntent ) {
						case 'wpadmin': {
							return redirect( `https://wordpress.com/home/${ siteSlug }` );
						}
						case 'build': {
							return navigate( 'designSetup' );
						}
						case 'sell': {
							return navigate( 'options' );
						}
						case 'import': {
							return redirect( `/start/importer/capture?siteSlug=${ siteSlug }` );
						}
						case 'write': {
							return navigate( 'options' );
						}
						default: {
							return navigate( submittedIntent as StepPath );
						}
					}
				}

				case 'storeFeatures': {
					const storeType = params[ 0 ];
					if ( storeType === 'power' ) {
						const args = new URLSearchParams();
						args.append( 'back_to', `/start/setup-site/store-features?siteSlug=${ siteSlug }` );
						args.append( 'siteSlug', siteSlug as string );
						return redirect( `/start/woocommerce-install?${ args.toString() }` );
					} else if ( storeType === 'simple' ) {
						return navigate( 'designSetup' );
					}
					return navigate( 'bloggerStartingPoint' );
				}

				case 'courses': {
					return redirect( `/post/${ siteSlug }` );
				}
			}
		}

		const goBack = () => {
			switch ( currentStep ) {
				case 'bloggerStartingPoint':
					return navigate( 'options' );

				case 'storeFeatures':
					return navigate( 'options' );

				case 'courses':
					return navigate( 'bloggerStartingPoint' );

				case 'designSetup':
					if ( intent === 'sell' ) {
						// this means we came from sell => store-features => start simple, we go back to store features
						return navigate( 'storeFeatures' );
					} else if ( intent === 'write' ) {
						// this means we came from write => blogger staring point => choose a design
						return navigate( 'bloggerStartingPoint' );
					}
					return navigate( 'intent' );

				default:
					return navigate( 'intent' );
			}
		};

		const goNext = () => {
			switch ( currentStep ) {
				case 'options':
					if ( intent === 'sell' ) {
						return navigate( 'storeFeatures' );
					}
					return navigate( 'bloggerStartingPoint' );

				default:
					return navigate( 'intent' );
			}
		};

		const goToStep = ( step: StepPath ) => {
			navigate( step );
		};

		function recordSubmitStep( providedDependencies: ProvidedDependencies = {} ) {
			const device = resolveDeviceTypeByViewPort();
			const inputs = reduce(
				providedDependencies,
				( props, propValue, propName: string ) => {
					propName = snakeCase( propName );

					// Ensure we don't capture identifiable user data we don't need.
					if ( propName === 'email' ) {
						propName = `user_entered_${ propName }`;
						propValue = !! propValue;
					}

					if ( propName === 'selected_design' ) {
						propValue = ( propValue as { slug: string } ).slug;
					}

					return {
						...props,
						[ propName ]: propValue,
					};
				},
				{}
			);

			recordTracksEvent( 'calypso_signup_actions_submit_step', {
				device,
				step: currentStep,
				intent,
				...inputs,
			} );
		}

		return { goNext, goBack, goToStep, submit };
	},
};
