/**
 * External dependencies
 */
import { TranslateResult, useTranslate } from 'i18n-calypso';
import React from 'react';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { MarketplaceThemeProps } from 'calypso/my-sites/marketplace/theme';
import { MarketplaceHeaderTitle } from 'calypso/my-sites/marketplace/components';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import VerticalNav from 'calypso/components/vertical-nav';
import { localizeUrl } from 'calypso/lib/i18n-utils';

/**
 * style dependencies
 */
import './style.scss';

const MarketplaceThankYouContainer = styled.div< MarketplaceThemeProps >`
	background-color: #fff;
	overflow: scroll;
	-ms-overflow-style: none;
	scrollbar-width: none;
	&::-webkit-scrollbar {
		display: none;
	}
	margin-top: var( --masterbar-height );
	height: calc( 100vh - var( --masterbar-height ) );
`;

const MarketplaceThankYouHeader = styled.div`
    width: 100%;
    height: 240px;
    background-color: var( --studio-gray-0 );
    display: flex;
    justify-content: center;
}`;

const MarketplaceThankyouSection = styled.div`
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

const MarketplaceNextSteps = styled.div< MarketplaceThemeProps >`
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
	masterbarItem?: React.ReactNode | React.ReactFragment;
	sections: ThankYouSectionProps[];
	showSupportSection?: boolean;
	thankYouImage: {
		alt: string;
		src: any;
		width?: number;
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
		<MarketplaceThankyouSection>
			<MarketplaceHeaderTitle subtitle className="marketplace-thank-you__body-header wp-brand-font">
				{ sectionTitle }
			</MarketplaceHeaderTitle>

			<MarketplaceNextSteps>{ nextStepComponents }</MarketplaceNextSteps>
		</MarketplaceThankyouSection>
	);
};

export const ThankYou = ( props: ThankYouProps ) => {
	const translate = useTranslate();

	const { sections, showSupportSection = true, thankYouTitle, thankYouImage } = props;

	const thankYouSections = sections.map( ( sectionProps, index ) => (
		<ThankYouSection key={ index } { ...sectionProps } />
	) );

	return (
		<MarketplaceThankYouContainer className="marketplace-thank-you__container checkout-thank-you">
			<MarketplaceThankYouHeader>
				{ /* eslint-disable-next-line jsx-a11y/alt-text */ }
				<img { ...thankYouImage } />
			</MarketplaceThankYouHeader>
			<ThankYouBody>
				<div>
					<MarketplaceThankyouSection>
						<MarketplaceHeaderTitle className="marketplace-thank-you__body-header wp-brand-font">
							{ thankYouTitle }
						</MarketplaceHeaderTitle>
					</MarketplaceThankyouSection>

					{ thankYouSections }

					{ showSupportSection && (
						<MarketplaceThankyouSection>
							<MarketplaceHeaderTitle
								subtitle
								className="marketplace-thank-you__body-header wp-brand-font"
							>
								{ translate( 'How can we help?' ) }
							</MarketplaceHeaderTitle>
							<p>
								{ translate(
									'Our Happiness Engineers are here if you need help, or if you have any questions.'
								) }
							</p>
							<VerticalNav>
								<VerticalNavItem path={ '/help/contact' }>
									{ translate( 'Ask a question' ) }
								</VerticalNavItem>
								<VerticalNavItem path={ localizeUrl( 'https://wordpress.com/support' ) }>
									{ translate( 'Support documentation' ) }
								</VerticalNavItem>
							</VerticalNav>
						</MarketplaceThankyouSection>
					) }
				</div>
			</ThankYouBody>
		</MarketplaceThankYouContainer>
	);
};
