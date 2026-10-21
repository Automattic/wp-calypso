import { Step } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { NavigationType, useNavigationType } from 'react-router';
import DocumentHead from 'calypso/components/data/document-head';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { logToLogstash } from 'calypso/lib/logstash';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { useSiteDomains } from '../../../../hooks/use-site-domains';
import { useSiteSetupError } from '../../../../hooks/use-site-setup-error';
import { isOnlyStepMounted } from '../../step-mount-registry';
import SupportCard from '../store-address/support-card';
import type { Step as StepType } from '../../types';
import './style.scss';

const WarningsOrHoldsSection = styled.div`
	margin-top: 40px;
`;

const documentArrivalReason = () => {
	const entry = performance.getEntriesByType?.( 'navigation' )[ 0 ] as
		PerformanceNavigationTiming | undefined;

	switch ( entry?.type ) {
		case 'reload':
			return 'document_reload';
		case 'back_forward':
			return 'document_back_forward';
		default:
			return 'document_load';
	}
};

/**
 * Why the customer is on this step, for the log line. A stored error names it best. Without one,
 * a step that is the first route in its document was reached by a load or a reload, and a step
 * reached by in-document Back or Forward was not navigated to by the flow. In both cases the
 * `errorReason` in its step data is the persisted one from an earlier arrival, so it comes after.
 */
const getArrivalReason = (
	error: string | undefined,
	message: string | undefined,
	errorReason: unknown,
	navigationType: NavigationType
) => {
	if ( error ) {
		return error;
	}
	if ( message ) {
		return 'stored_message_without_code';
	}
	if ( isOnlyStepMounted( 'error' ) ) {
		return documentArrivalReason();
	}
	if ( navigationType === NavigationType.Pop ) {
		return 'history_back_forward';
	}
	if ( typeof errorReason === 'string' && errorReason ) {
		return errorReason;
	}
	return 'no_stored_error';
};

const ErrorStep: StepType< {
	accepts: { showRetry?: boolean };
	submits: { action: 'retry' };
} > = function ErrorStep( { flow, variantSlug, data, showRetry, navigation } ) {
	const { __ } = useI18n();
	const locale = useSelector( getCurrentUserLocale ) || 'en';
	const siteDomains = useSiteDomains();
	const { error, message } = useSiteSetupError();
	const errorReason = data?.errorReason;
	const previousStep = data?.previousStep;
	const navigationType = useNavigationType();

	let domain = '';

	if ( siteDomains && siteDomains.length > 0 ) {
		domain = siteDomains[ 0 ].domain;
	}

	useEffect( () => {
		const localeBucket = 'en' === locale ? 'en' : 'non_en';
		bumpStat( 'calypso_stepper_error_step', `${ flow }_${ localeBucket }` );

		// Only a flow navigation writes the step data. After a document load or a history arrival,
		// the persisted step data can come from an earlier arrival, even in another flow, so the
		// log line flags it.
		const isFlowArrival = ! isOnlyStepMounted( 'error' ) && navigationType !== NavigationType.Pop;

		// Some flows navigate here without storing an error. Log those arrivals too,
		// so every bump of the stat above has a log line to split by error code.
		logToLogstash( {
			feature: 'calypso_client',
			message: 'Error in Stepper flow',
			extra: {
				error,
				message,
				flow,
				variant: variantSlug,
				previous_step: previousStep,
				error_reason: errorReason,
				is_flow_arrival: isFlowArrival,
			},
			properties: {
				flow,
				locale,
				error: getArrivalReason( error, message, errorReason, navigationType ),
			},
		} );
	}, [ error, errorReason, flow, locale, message, navigationType, previousStep, variantSlug ] );

	const getContent = () => {
		const errorMessage = [ error, message ].filter( Boolean ).join( ': ' );
		return (
			<>
				{ !! errorMessage && <p className="error-step__message">{ errorMessage }</p> }
				{ showRetry && (
					<Step.PrimaryButton onClick={ () => navigation.submit( { action: 'retry' } ) }>
						{ __( 'Try again' ) }
					</Step.PrimaryButton>
				) }
				<WarningsOrHoldsSection>
					<SupportCard domain={ domain } />
				</WarningsOrHoldsSection>
			</>
		);
	};

	const headerText = __( "We've hit a snag" );
	const subHeaderText = __(
		'It looks like something went wrong while setting up your site. Please contact support so that we can help you out.'
	);

	return (
		<>
			<DocumentHead title={ headerText } />
			<Step.CenteredColumnLayout
				columnWidth={ 8 }
				topBar={ <Step.TopBar /> }
				heading={ <Step.Heading text={ headerText } /> }
			>
				{ subHeaderText }
				{ getContent() }
			</Step.CenteredColumnLayout>
		</>
	);
};

export default ErrorStep;
