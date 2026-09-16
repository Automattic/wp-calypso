import { Step } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { bumpStat } from 'calypso/lib/analytics/mc';
import { logToLogstash } from 'calypso/lib/logstash';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { useSiteDomains } from '../../../../hooks/use-site-domains';
import { useSiteSetupError } from '../../../../hooks/use-site-setup-error';
import SupportCard from '../store-address/support-card';
import type { Step as StepType } from '../../types';
import './style.scss';

const WarningsOrHoldsSection = styled.div`
	margin-top: 40px;
`;

const ErrorStep: StepType = function ErrorStep( { flow, variantSlug } ) {
	const { __ } = useI18n();
	const locale = useSelector( getCurrentUserLocale ) || 'en';
	const siteDomains = useSiteDomains();
	const { error, message } = useSiteSetupError();

	let domain = '';

	if ( siteDomains && siteDomains.length > 0 ) {
		domain = siteDomains[ 0 ].domain;
	}

	useEffect( () => {
		const localeBucket = 'en' === locale ? 'en' : 'non_en';
		bumpStat( 'calypso_stepper_error_step', `${ flow }_${ localeBucket }` );

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
			properties: {
				flow,
				locale,
				error,
			},
		} );
	}, [ error, flow, locale, message, variantSlug ] );

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
