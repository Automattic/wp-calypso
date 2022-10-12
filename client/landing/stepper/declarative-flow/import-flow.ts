import { isEnabled } from '@automattic/calypso-config';
import { Design, isBlankCanvasDesign } from '@automattic/design-picker';
import { IMPORT_FOCUSED_FLOW } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { ImporterMainPlatform } from 'calypso/blocks/import/types';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { StepPath } from './internals/steps-repository';
import { Flow, ProvidedDependencies } from './internals/types';

export const importFlow: Flow = {
	name: IMPORT_FOCUSED_FLOW,

	useSteps() {
		return [
			'import',
			'importList',
			'importReady',
			'importReadyNot',
			'importReadyWpcom',
			'importReadyPreview',
			'importerWix',
			'importerBlogger',
			'importerMedium',
			'importerSquarespace',
			'importerWordpress',
			'designSetup',
			'patternAssembler',
			'processing',
		] as StepPath[];
	},

	useStepNavigation( _currentStep, navigate ) {
		const urlQueryParams = useQuery();
		const siteSlugParam = useSiteSlugParam();
		const isDesktop = useViewportMatch( 'large' );
		const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );

		const appendFlowQueryParam = ( path: string ) => {
			const joinChar = path.includes( '?' ) ? '&' : '?';

			return `${ path }${ joinChar }flow=${ this.name }`;
		};

		const exitFlow = ( to: string ) => {
			window.location.assign( to as string );

			return navigate( 'processing' );
		};

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( _currentStep ) {
				case 'importReady': {
					if (
						[ 'blogroll', 'ghost', 'tumblr', 'livejournal', 'movabletype', 'xanga' ].indexOf(
							providedDependencies?.platform as ImporterMainPlatform
						) !== -1
					) {
						return exitFlow( providedDependencies?.url as string );
					}

					return navigate(
						appendFlowQueryParam( providedDependencies?.url as string ) as StepPath
					);
				}
				case 'importReadyPreview': {
					return navigate(
						appendFlowQueryParam( providedDependencies?.url as string ) as StepPath
					);
				}

				case 'importerWix':
				case 'importerBlogger':
				case 'importerMedium':
				case 'importerSquarespace':
				case 'importerWordpress': {
					if ( providedDependencies?.type === 'redirect' ) {
						return exitFlow( providedDependencies?.url as string );
					}

					return navigate(
						appendFlowQueryParam( providedDependencies?.url as string ) as StepPath
					);
				}

				case 'designSetup': {
					if (
						isDesktop &&
						isBlankCanvasDesign( providedDependencies?.selectedDesign as Design )
					) {
						return navigate( 'patternAssembler' );
					}

					return navigate( 'processing' );
				}

				case 'patternAssembler':
					return navigate( 'processing' );

				case 'processing': {
					// End of Pattern Assembler flow
					if (
						isEnabled( 'signup/design-picker-pattern-assembler' ) &&
						isBlankCanvasDesign( selectedDesign as Design )
					) {
						return exitFlow( `/site-editor/${ siteSlugParam }` );
					}

					return exitFlow( `/home/${ siteSlugParam }` );
				}
			}
		};

		const goBack = () => {
			switch ( _currentStep ) {
				case 'importList':
					// eslint-disable-next-line no-case-declarations
					const backToStep = urlQueryParams.get( 'backToStep' );

					if ( backToStep ) {
						const path = `${ backToStep }?siteSlug=${ siteSlugParam }`;

						return navigate( appendFlowQueryParam( path ) as StepPath );
					}

					return navigate( 'import' );

				case 'importReady':
				case 'importReadyNot':
				case 'importReadyWpcom':
				case 'importReadyPreview':
				case 'importerWix':
				case 'importerBlogger':
				case 'importerMedium':
				case 'importerSquarespace':
				case 'importerWordpress':
				case 'designSetup':
					return navigate( 'import' );
			}
		};

		const goNext = () => {
			switch ( _currentStep ) {
				default:
					return navigate( 'import' );
			}
		};

		const goToStep = ( step: StepPath | `${ StepPath }?${ string }` ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};
