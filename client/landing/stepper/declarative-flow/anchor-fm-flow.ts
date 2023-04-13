import { isEnabled } from '@automattic/calypso-config';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import DesignSetup from './internals/steps-repository/design-setup';
import ErrorStep from './internals/steps-repository/error-step';
import { redirect } from './internals/steps-repository/import/util';
import LoginStep from './internals/steps-repository/login';
import PodcastTitleStep from './internals/steps-repository/podcast-title';
import ProcessingStep from './internals/steps-repository/processing-step';
import {
	AssertConditionState,
	type AssertConditionResult,
	type Flow,
	type ProvidedDependencies,
} from './internals/types';
import type { SiteSelect } from '@automattic/data-stores';

export function isAnchorFmFlow() {
	const sanitizePodcast = ( id: string ) => id.replace( /[^a-zA-Z0-9]/g, '' );
	const anchorPodcast = new URLSearchParams( window.location.search ).get( 'anchor_podcast' );

	return Boolean( sanitizePodcast( anchorPodcast || '' ) );
}

const anchorFmFlow: Flow = {
	name: 'anchor-fm',

	useSteps() {
		if ( isEnabled( 'anchor/sunset-integration' ) ) {
			return [ { slug: 'error', component: ErrorStep } ];
		}
		return [
			{ slug: 'login', component: LoginStep },
			{ slug: 'podcastTitle', component: PodcastTitleStep },
			{ slug: 'designSetup', component: DesignSetup },
			{ slug: 'processing', component: ProcessingStep },
			{ slug: 'error', component: ErrorStep },
		];
	},

	useAssertConditions(): AssertConditionResult {
		const { setSiteSetupError } = useDispatch( SITE_STORE );
		const { __ } = useI18n();

		if ( isEnabled( 'anchor/sunset-integration' ) ) {
			const error = __( 'Anchor.fm Discontinuation Notice' );
			const message = __(
				"We're sorry to inform you that the Anchor.fm integration with WordPress.com is being discontinued. As a result, you may have encountered an error while setting up your site. We apologize for any inconvenience. Please contact our support team for assistance or return to Anchor.fm to continue managing your podcast."
			);
			setSiteSetupError( error, message );
		}
		return { state: AssertConditionState.SUCCESS };
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const { getNewSite } = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );
		const siteSlugParam = useSiteSlugParam();

		if ( isEnabled( 'anchor/sunset-integration' ) ) {
			return {};
		}

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
