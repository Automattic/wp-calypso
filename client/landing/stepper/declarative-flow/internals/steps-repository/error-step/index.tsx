import { Step, StepContainer } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { shouldUseStepContainerV2MigrationFlow } from 'calypso/landing/stepper/declarative-flow/helpers/should-use-step-container-v2';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
import { useSiteDomains } from '../../../../hooks/use-site-domains';
import { useSiteSetupError } from '../../../../hooks/use-site-setup-error';
import SupportCard from '../store-address/support-card';
import type { Step as StepType } from '../../types';
import './style.scss';

const WarningsOrHoldsSection = styled.div`
	margin-top: 40px;
`;

const ErrorStep: StepType = function ErrorStep( { navigation, flow, variantSlug } ) {
	const { goBack, goNext } = navigation;
	const { __ } = useI18n();
	const siteDomains = useSiteDomains();
	const { error, message } = useSiteSetupError();
	const isUsingStepContainerV2 = shouldUseStepContainerV2MigrationFlow( flow );

	let domain = '';

	if ( siteDomains && siteDomains.length > 0 ) {
		domain = siteDomains[ 0 ].domain;
	}

	useEffect( () => {
		if ( ! error || ! message ) {
			return;
		}

		logToLogstash( {
			feature: 'calypso_client',
			message: 'Error in Stepper flow',
			extra: {
				error,
				message,
				flow,
				variant: variantSlug,
			},
		} );
	}, [ error, flow, message, variantSlug ] );

	const getContent = () => {
		const errorMessage = [ error, message ].filter( Boolean ).join( ': ' );
		return (
			<>
				{ !! errorMessage && <p className="error-step__message">{ errorMessage }</p> }
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

	if ( isUsingStepContainerV2 ) {
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
	}

	return (
		<StepContainer
			stepName="error-step"
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			formattedHeader={
				<>
					<FormattedHeader id="step-error-header" headerText={ headerText } align="left" />
					<p>{ subHeaderText }</p>
				</>
			}
			stepContent={ getContent() }
			recordTracksEvent={ recordTracksEvent }
			hideBack
			hideSkip
			hideNext
		/>
	);
};

export default ErrorStep;
