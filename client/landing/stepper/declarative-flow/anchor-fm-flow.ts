import { useSelect } from '@wordpress/data';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { redirect } from './internals/steps-repository/import/util';
import type { Flow, ProvidedDependencies } from './internals/types';
import type { SiteSelect } from '@automattic/data-stores';

export function isAnchorFmFlow() {
	const sanitizePodcast = ( id: string ) => id.replace( /[^a-zA-Z0-9]/g, '' );
	const anchorPodcast = new URLSearchParams( window.location.search ).get( 'anchor_podcast' );

	return Boolean( sanitizePodcast( anchorPodcast || '' ) );
}

const anchorFmFlow: Flow = {
	name: 'anchor-fm',

	useSteps() {
		return [
			{ slug: 'login', component: () => import( './internals/steps-repository/login' ) },
			{
				slug: 'podcastTitle',
				component: () => import( './internals/steps-repository/podcast-title' ),
			},
			{
				slug: 'designSetup',
				component: () => import( './internals/steps-repository/design-setup' ),
			},
			{
				slug: 'processing',
				component: () => import( './internals/steps-repository/processing-step' ),
			},
			{ slug: 'error', component: () => import( './internals/steps-repository/error-step' ) },
		];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const { getNewSite } = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );
		const siteSlugParam = useSiteSlugParam();

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, 'anchor-fm', flowName, currentStep );
			const siteSlug = siteSlugParam || getNewSite()?.site_slug;

			switch ( currentStep ) {
				case 'login':
					return navigate( 'podcastTitle' );
				case 'podcastTitle':
					return navigate( 'designSetup' );
				case 'designSetup':
					return navigate( 'processing' );
				case 'processing':
					return redirect( `/page/${ siteSlug }/home` );
			}
		}

		const goBack = () => {
			switch ( currentStep ) {
				case 'designSetup':
					return navigate( 'podcastTitle' );
				default:
					return navigate( 'podcastTitle' );
			}
		};

		const goNext = () => {
			const siteSlug = siteSlugParam || getNewSite()?.site_slug;

			switch ( currentStep ) {
				case 'login':
					return navigate( 'podcastTitle' );
				case 'podcastTitle':
					return navigate( 'designSetup' );
				case 'designSetup':
					return navigate( 'processing' );
				case 'processing':
					return redirect( `/page/${ siteSlug }/home` );
				default:
					return navigate( 'podcastTitle' );
			}
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default anchorFmFlow;
