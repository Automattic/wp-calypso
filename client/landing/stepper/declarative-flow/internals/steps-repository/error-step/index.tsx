import { StepContainer } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSiteDomains } from '../../../../hooks/use-site-domains';
import { useSiteSetupError } from '../../../../hooks/use-site-setup-error';
import SupportCard from '../store-address/support-card';
import type { Step } from '../../types';
import './style.scss';

const WarningsOrHoldsSection = styled.div`
	margin-top: 40px;
`;

const ErrorStep: Step = function ErrorStep( { navigation } ) {
	const { goBack, goNext } = navigation;
	const { __ } = useI18n();
	const siteDomains = useSiteDomains();
	const { error, message } = useSiteSetupError();

	let domain = '';

	if ( siteDomains && siteDomains.length > 0 ) {
		domain = siteDomains[ 0 ].domain;
	}

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

	return (
		<StepContainer
			stepName="error-step"
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			formattedHeader={
				<>
					<FormattedHeader
						id="step-error-header"
						headerText={ __( "We've hit a snag" ) }
						align="left"
					/>
					<p>
						{ __(
							'It looks like something went wrong while setting up your site. Please contact support so that we can help you out.'
						) }
					</p>
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
