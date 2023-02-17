import { useSelect } from '@wordpress/data';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import DesignSetup from './internals/steps-repository/design-setup';
import ErrorStep from './internals/steps-repository/error-step';
import { redirect } from './internals/steps-repository/import/util';
import LoginStep from './internals/steps-repository/login';
import PodcastTitleStep from './internals/steps-repository/podcast-title';
import ProcessingStep from './internals/steps-repository/processing-step';
import type { Flow, ProvidedDependencies } from './internals/types';

export function isAnchorFmFlow() {
	const sanitizePodcast = ( id: string ) => id.replace( /[^a-zA-Z0-9]/g, '' );
	const anchorPodcast = new URLSearchParams( window.location.search ).get( 'anchor_podcast' );

	return Boolean( sanitizePodcast( anchorPodcast || '' ) );
}

const anchorFmFlow: Flow = {
	name: 'anchor-fm',

	useSteps() {
		return [
			{ slug: 'login', component: LoginStep },
			{ slug: 'podcastTitle', component: PodcastTitleStep },
			{ slug: 'designSetup', component: DesignSetup },
			{ slug: 'processing', component: ProcessingStep },
			{ slug: 'error', component: ErrorStep },
		];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const { getNewSite } = useSelect( ( select ) => select( SITE_STORE ) );
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
