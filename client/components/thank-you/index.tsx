/**
 * External dependencies
 */
import classNames from 'classnames';
import type { TranslateResult } from 'i18n-calypso';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { CALYPSO_CONTACT, SUPPORT_ROOT } from 'calypso/lib/url/support';
import { MarketplaceThemeProps } from 'calypso/my-sites/marketplace/theme';
import { MarketplaceHeaderTitle } from 'calypso/my-sites/marketplace/components';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import VerticalNav from 'calypso/components/vertical-nav';

/**
 * style dependencies
 */
import './style.scss';

const ThankYouContainer = styled.div< MarketplaceThemeProps >`
	background-color: #fff;
	-ms-overflow-style: none;
	/* Negative value to counteract default content padding */
	margin-top: calc( -79px + var( --masterbar-height ) );

	@media screen and ( max-width: 782px ) {
		margin-top: 0;
	}
`;

const ThankYouHeader = styled.div`
    width: 100%;
    height: 240px;
    background-color: var( --studio-gray-0 );
    display: flex;
    justify-content: center;
}`;

const ThankYouSectionContainer = styled.div`
    margin-bottom: 35px;
}`;

const ThankYouBody = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	margin-top: 50px;
	> div {
		width: 460px;
		padding: 0 35px;
	}
	div {
		min-width: 144px;
	}
`;

const ThankYouNextSteps = styled.div< MarketplaceThemeProps >`
	h3 {
		font-weight: ${ ( { theme } ) => theme?.weights.bold };
	}

	p {
		color: var( --studio-gray-50 );
		padding-right: 20px;
	}
	> div {
		display: flex;
	}
`;

export type ThankYouNextStepProps = {
	stepCta: React.ReactNode | React.ReactFragment;
	stepDescription: TranslateResult;
	stepKey: string;
	stepTitle: TranslateResult;
};

export type ThankYouSectionProps = {
	nextSteps: ThankYouNextStepProps[];
	sectionKey: string;
	sectionTitle: TranslateResult;
};

export type ThankYouProps = {
	containerClassName?: string;
	sections: ThankYouSectionProps[];
	showSupportSection?: boolean;
	thankYouImage: {
		alt: string | TranslateResult;
		src: string;
	};
	thankYouTitle: TranslateResult;
};

const ThankYouNextStep = ( props: ThankYouNextStepProps ) => {
	const { stepCta, stepDescription, stepKey, stepTitle } = props;

	return (
		<React.Fragment key={ stepKey }>
			<h3>{ stepTitle }</h3>
			<div>
				<p>{ stepDescription }</p>
				<div>{ stepCta }</div>
			</div>
		</React.Fragment>
	);
};

const ThankYouSection = ( props: ThankYouSectionProps ) => {
	const { nextSteps, sectionTitle } = props;

	const nextStepComponents = nextSteps.map( ( nextStepProps, index ) => (
		<ThankYouNextStep key={ index } { ...nextStepProps } />
	) );

	return (
		<ThankYouSectionContainer>
			<MarketplaceHeaderTitle subtitle className="thank-you__body-header wp-brand-font">
				{ sectionTitle }
			</MarketplaceHeaderTitle>

			<ThankYouNextSteps>{ nextStepComponents }</ThankYouNextSteps>
		</ThankYouSectionContainer>
	);
};

export const ThankYou = ( props: ThankYouProps ): JSX.Element => {
	const translate = useTranslate();

	const {
		containerClassName,
		sections,
		showSupportSection = true,
		thankYouTitle,
		thankYouImage,
	} = props;

	const thankYouSections = sections.map( ( sectionProps, index ) => (
		<ThankYouSection key={ index } { ...sectionProps } />
	) );

	return (
		<ThankYouContainer className={ classNames( 'thank-you__container', containerClassName ) }>
			<ThankYouHeader className="thank-you__container-header">
				{ /* eslint-disable-next-line jsx-a11y/alt-text */ }
				<img { ...thankYouImage } />
			</ThankYouHeader>
			<ThankYouBody>
				<div>
					<ThankYouSectionContainer>
						<MarketplaceHeaderTitle className="thank-you__body-header wp-brand-font">
							{ thankYouTitle }
						</MarketplaceHeaderTitle>
					</ThankYouSectionContainer>

					{ thankYouSections }

					{ showSupportSection && (
						<ThankYouSectionContainer>
							<MarketplaceHeaderTitle subtitle className="thank-you__body-header wp-brand-font">
								{ translate( 'How can we help?' ) }
							</MarketplaceHeaderTitle>
							<p>
								{ translate(
									'Our Happiness Engineers are here if you need help, or if you have any questions.'
								) }
							</p>
							<VerticalNav>
								<VerticalNavItem path={ CALYPSO_CONTACT }>
									{ translate( 'Ask a question' ) }
								</VerticalNavItem>
								<VerticalNavItem path={ SUPPORT_ROOT }>
									{ translate( 'Support documentation' ) }
								</VerticalNavItem>
							</VerticalNav>
						</ThankYouSectionContainer>
					) }
				</div>
			</ThankYouBody>
		</ThankYouContainer>
	);
};
