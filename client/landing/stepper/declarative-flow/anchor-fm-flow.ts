import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import ErrorStep from './internals/steps-repository/error-step';
import { AssertConditionState, type AssertConditionResult, type Flow } from './internals/types';

export function isAnchorFmFlow() {
	const sanitizePodcast = ( id: string ) => id.replace( /[^a-zA-Z0-9]/g, '' );
	const anchorPodcast = new URLSearchParams( window.location.search ).get( 'anchor_podcast' );

	return Boolean( sanitizePodcast( anchorPodcast || '' ) );
}

const anchorFmFlow: Flow = {
	name: 'anchor-fm',

	useSteps() {
		return [ { slug: 'error', component: ErrorStep } ];
	},

	useAssertConditions(): AssertConditionResult {
		const { setSiteSetupError } = useDispatch( SITE_STORE );
		const { __ } = useI18n();

		const error = __( '[Notice title]' );
		const message = __( '[Notice message]' );
		setSiteSetupError( error, message );
		return { state: AssertConditionState.SUCCESS };
	},

	useStepNavigation() {
		return {};
	},
};

export default anchorFmFlow;
