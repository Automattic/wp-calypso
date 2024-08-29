import { Onboard, useLaunchpad } from '@automattic/data-stores';
import { isAssemblerDesign } from '@automattic/design-picker';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useQuery } from '../hooks/use-query';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE } from '../stores';
import { STEPS } from './internals/steps';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import { ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';
import type { OnboardSelect } from '@automattic/data-stores';

const updateDesign: Flow = {
	name: 'update-design',
	get title() {
		return translate( 'Choose Design' );
	},
	isSignupFlow: false,
	useSteps() {
		return [ STEPS.DESIGN_SETUP, STEPS.PATTERN_ASSEMBLER, STEPS.PROCESSING, STEPS.ERROR ];
	},
	useSideEffect() {
		const { setIntent } = useDispatch( ONBOARD_STORE );

		useEffect( () => {
			setIntent( Onboard.SiteIntent.UpdateDesign );
		}, [] );
	},
	useStepNavigation( currentStep, navigate ) {
		const siteSlug = useSiteSlug();
		const flowToReturnTo = useQuery().get( 'flowToReturnTo' ) || 'free';
		const { setPendingAction } = useDispatch( ONBOARD_STORE );
		const selectedDesign = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
			[]
		);
		const { data: { launchpad_screen: launchpadScreenOption } = {} } = useLaunchpad( siteSlug );

		const exitFlow = ( to: string ) => {
			setPendingAction( () => {
				return new Promise( () => {
					window.location.assign( to );
				} );
			} );

			return navigate( 'processing' );
		};

		function submit( providedDependencies: ProvidedDependencies = {}, ...results: string[] ) {
			switch ( currentStep ) {
				case 'processing':
					if ( results.some( ( result ) => result === ProcessingResult.FAILURE ) ) {
						return navigate( 'error' );
					}

					if ( isAssemblerDesign( selectedDesign ) ) {
						const params = new URLSearchParams( {
							canvas: 'edit',
							assembler: '1',
						} );

						return exitFlow( `/site-editor/${ siteSlug }?${ params }` );
					}

					if ( launchpadScreenOption === 'skipped' ) {
						return window.location.assign( `/home/${ siteSlug }` );
					}

					return window.location.assign(
						`/setup/${ flowToReturnTo }/launchpad?siteSlug=${ siteSlug }`
					);

				case 'designSetup':
					if ( providedDependencies?.goToCheckout ) {
						const destination = `/setup/${ flowToReturnTo }/launchpad?siteSlug=${ providedDependencies.siteSlug }`;
						persistSignupDestination( destination );
						setSignupCompleteSlug( providedDependencies?.siteSlug );
						setSignupCompleteFlowName( flowToReturnTo );
						const returnUrl = encodeURIComponent(
							`/setup/${ flowToReturnTo }/launchpad?siteSlug=${ providedDependencies?.siteSlug }`
						);

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( providedDependencies?.siteSlug as string ) ?? ''
							) }?redirect_to=${ returnUrl }&signup=1`
						);
					}

					if ( providedDependencies?.shouldGoToAssembler ) {
						return navigate( 'pattern-assembler' );
					}

					return navigate( `processing?siteSlug=${ siteSlug }&flowToReturnTo=${ flowToReturnTo }` );

				case 'pattern-assembler': {
					return navigate( `processing?siteSlug=${ siteSlug }&flowToReturnTo=${ flowToReturnTo }` );
				}
			}
		}

		const goBack = () => {
			switch ( currentStep ) {
				case 'pattern-assembler':
					return navigate( 'designSetup' );
			}
		};

		return { submit, goBack };
	},
};

export default updateDesign;
