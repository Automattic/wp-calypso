/**
 * External dependencies
 */
import styled from '@emotion/styled';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import { CALYPSO_CONTACT, SUPPORT_ROOT } from 'calypso/lib/url/support';
import type {
	ThankYouNextStepProps,
	ThankYouProps,
	ThankYouSectionProps,
} from 'calypso/components/thank-you/types';

/**
 * style dependencies
 */
import './style.scss';

const ThankYouContainer = styled.div`
	background-color: #fff;
	-ms-overflow-style: none;
	/* Negative value to counteract default content padding */
	margin-top: calc( -79px + var( --masterbar-height ) );
`;

const ThankYouSectionTitle = styled.h1`
	font-size: 1.5em;
	margin-bottom: 8px;
`;

const ThankYouSectionContainer = styled.div`
	margin-bottom: 35px;
`;

const ThankYouBody = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	margin-top: 50px;
	> div {
		width: 600px;
		padding: 0 35px;
	}
	div {
		min-width: 144px;
	}
`;

const ThankYouNextSteps = styled.div`
	h3 {
		font-weight: 600;
	}

	p {
		color: var( --studio-gray-50 );
		padding-right: 20px;
	}
	> div {
		display: flex;
	}
`;

const ThankYouNextStep = ( props: ThankYouNextStepProps ) => {
	const { stepCta, stepDescription, stepKey, stepTitle } = props;

	return (
		<div className="thank-you__step" key={ stepKey }>
			<div>
				<h3>{ stepTitle }</h3>
				<p>{ stepDescription }</p>
			</div>
			<div className="thank-you__step-cta">{ stepCta }</div>
		</div>
	);
};

const ThankYouSection = ( props: ThankYouSectionProps ) => {
	const { nextSteps, sectionTitle } = props;

	const nextStepComponents = nextSteps.map( ( nextStepProps, index ) => (
		<ThankYouNextStep key={ index } { ...nextStepProps } />
	) );

	return (
		<ThankYouSectionContainer>
			<ThankYouSectionTitle className="thank-you__body-header wp-brand-font">
				{ sectionTitle }
			</ThankYouSectionTitle>

			<ThankYouNextSteps>{ nextStepComponents }</ThankYouNextSteps>
		</ThankYouSectionContainer>
	);
};

export const ThankYou = ( props: ThankYouProps ): JSX.Element => {
	const translate = useTranslate();

	const {
		headerBackgroundColor = '#0675C4',
		headerClassName,
		headerTextColor = 'white',
		containerClassName,
		sections,
		showSupportSection = true,
		thankYouTitle,
		thankYouSubtitle,
		thankYouImage,
	} = props;

	const ThankYouTitleContainer = styled.div`
		h1 {
			font-size: 2em;
		}
		h2 {
			margin-bottom: 16px;
		}
		color: ${ headerTextColor };
	`;

	const ThankYouHeader = styled.div`
		width: 100%;
		display: flex;
		justify-content: center;
		background-color: ${ headerBackgroundColor };
		min-height: 352px;
		img {
			width: auto;
			height: 200px;
			margin-bottom: 14px;
		}
	`;

	const thankYouSections = sections.map( ( sectionProps, index ) => (
		<ThankYouSection key={ index } { ...sectionProps } />
	) );

	return (
		<ThankYouContainer className={ classNames( 'thank-you__container', containerClassName ) }>
			<ThankYouHeader className={ classNames( 'thank-you__container-header', headerClassName ) }>
				{ /* eslint-disable-next-line jsx-a11y/alt-text */ }
				<img { ...thankYouImage } />
				{ thankYouTitle && (
					<ThankYouTitleContainer>
						<h1 className="thank-you__header-title wp-brand-font">{ thankYouTitle }</h1>
						{ thankYouSubtitle && <h2>{ thankYouSubtitle }</h2> }
					</ThankYouTitleContainer>
				) }
			</ThankYouHeader>
			<ThankYouBody className="thank-you__body">
				<div>
					{ thankYouSections }

					{ showSupportSection && (
						<ThankYouSectionContainer>
							<ThankYouSectionTitle className="thank-you__body-header wp-brand-font">
								{ translate( 'How can we help?' ) }
							</ThankYouSectionTitle>
							<p className="thank-you__help-text">
								{ translate(
									'Our Happiness Engineers are here if you need help, or if you have any questions.'
								) }
							</p>
							<a
								className="thank-you__help-link"
								href={ CALYPSO_CONTACT }
								target="_blank"
								rel="noreferrer noopener"
							>
								{ translate( 'Ask a question' ) }
								<Gridicon className="thank-you__icon-external" icon="external" />
							</a>
							<a
								className="thank-you__help-link"
								href={ SUPPORT_ROOT }
								target="_blank"
								rel="noreferrer noopener"
							>
								{ translate( 'View support documentation' ) }
								<Gridicon className="thank-you__icon-external" icon="external" />
							</a>
						</ThankYouSectionContainer>
					) }
				</div>
			</ThankYouBody>
		</ThankYouContainer>
	);
};
