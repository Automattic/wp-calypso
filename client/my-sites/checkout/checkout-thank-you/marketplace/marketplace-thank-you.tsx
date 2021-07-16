/**
 * External dependencies
 */
import { isDesktop } from '@automattic/viewport';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import page from 'page';
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { ThemeProvider } from 'emotion-theming';
import type TranslateResult from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Masterbar from 'calypso/layout/masterbar/masterbar';
import Item from 'calypso/layout/masterbar/item';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import yoastInstalledImage from 'calypso/assets/images/marketplace/yoast-installed.svg';
import theme from 'calypso/my-sites/marketplace/theme';
import type { MarketplaceThemeProps } from 'calypso/my-sites/marketplace/theme';
import { MarketplaceHeaderTitle, FullWidthButton } from 'calypso/my-sites/marketplace/components';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import useSiteMenuItems from 'calypso/my-sites/sidebar-unified/use-site-menu-items';
import { getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import { getPurchaseFlowState } from 'calypso/state/marketplace/purchase-flow/selectors';
import {
	isFetchingAutomatedTransferStatus,
	getAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/selectors';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';

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

	const nextStepComponents = nextSteps.map( ( nextStepProps ) => (
		<ThankYouNextStep { ...nextStepProps } />
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

	const {
		masterbarItem,
		sections,
		showSupportSection = true,
		thankYouTitle,
		thankYouImage,
	} = props;

	const thankYouSections = sections.map( ( sectionProps ) => (
		<ThankYouSection { ...sectionProps } />
	) );

	return (
		<>
			{ masterbarItem && <Masterbar>{ masterbarItem }</Masterbar> }

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
		</>
	);
};

const MarketplaceThankYou = () => {
	const [ pollCount, setPollCount ] = useState( 0 );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const dispatch = useDispatch();

	const isFetchingTransferStatus = useSelector( ( state ) =>
		isFetchingAutomatedTransferStatus( state, selectedSiteId ?? 0 )
	);

	const { isPluginInstalledDuringPurchase } = useSelector( getPurchaseFlowState );
	const transferStatus = useSelector( ( state ) =>
		getAutomatedTransferStatus( state, selectedSiteId ?? 0 )
	);
	const menuItems = useSiteMenuItems();
	const isRequestingMenu = useSelector( getIsRequestingAdminMenu );
	const { url: postsPageUrl } =
		menuItems.find( ( { slug }: { slug: string } ) => slug === 'edit-php' ) ?? {};

	const { url: yoastSeoPageUrl } =
		menuItems.find( ( { slug }: { slug: string } ) => slug === 'wpseo_dashboard' ) ?? {};

	const translate = useTranslate();
	const imageWidth = isDesktop() ? 200 : 150;

	useEffect( () => {
		if ( ! postsPageUrl || ! yoastSeoPageUrl ) {
			selectedSiteId && dispatch( requestAdminMenu( selectedSiteId ) );
		}
	}, [ dispatch, postsPageUrl, selectedSiteId, yoastSeoPageUrl ] );

	useEffect( () => {
		if (
			isPluginInstalledDuringPurchase &&
			transferStatus !== 'complete' &&
			! isFetchingTransferStatus
		) {
			setTimeout( () => {
				selectedSiteId && dispatch( fetchAutomatedTransferStatus( selectedSiteId ) );
				setPollCount( ( c ) => c + 1 );
			}, 1500 );
		}
	}, [
		isFetchingTransferStatus,
		isPluginInstalledDuringPurchase,
		pollCount,
		setPollCount,
		dispatch,
		transferStatus,
		selectedSiteId,
	] );

	/* TODO: Make all these items product-dependent */
	const masterbarItem = (
		<Item
			icon="cross"
			onClick={ () => page( `/marketplace/product/details/wordpress-seo/${ selectedSiteSlug }` ) }
			tooltip={ translate( 'Go to plugin' ) }
			tipTarget="close"
		/>
	);

	const thankYouImage = {
		alt: 'yoast logo',
		src: yoastInstalledImage,
		width: imageWidth,
	};

	const yoastSetupSection = {
		sectionKey: 'yoast_whats_next',
		sectionTitle: translate( 'What’s next?' ),
		nextSteps: [
			{
				stepKey: 'yoast_whats_next_plugin_setup',
				stepTitle: translate( 'Plugin setup' ),
				stepDescription: translate(
					'Get to know Yoast SEO and customize it, so you can hit the ground running.'
				),
				stepCta: (
					<FullWidthButton
						href={ yoastSeoPageUrl }
						primary
						busy={ isRequestingMenu }
						// TODO: Menu links are not properly loading on initial request, post transfer so yoastSeoPageUrl will remain empty post transfer
						// This should be fixed with perhaps a work around to periodically poll for the menu with various domains until it loads
						// or maybe blocking the user from entering this flow until a domain acquires SSL
						disabled={ ! yoastSeoPageUrl }
					>
						{ translate( 'Get started' ) }
					</FullWidthButton>
				),
			},
			{
				stepKey: 'yoast_whats_next_view_posts',
				stepTitle: translate( 'Start putting SEO to work' ),
				stepDescription: translate(
					"Improve your site's performance and rank higher with a few tips."
				),
				stepCta: (
					<FullWidthButton
						href={ postsPageUrl }
						busy={ isRequestingMenu }
						disabled={ ! yoastSeoPageUrl }
					>
						{ translate( 'View posts' ) }
					</FullWidthButton>
				),
			},
		],
	};

	return (
		<ThankYou
			masterbarItem={ masterbarItem }
			sections={ [ yoastSetupSection ] }
			showSupportSection={ true }
			thankYouImage={ thankYouImage }
			/* TODO: Change thank you message to be dynamic according to product */
			thankYouTitle={ translate( 'Yoast SEO Premium is installed' ) }
		/>
	);
};

export default function MarketplaceWrapper(): JSX.Element {
	return (
		<ThemeProvider theme={ theme }>
			<MarketplaceThankYou />
		</ThemeProvider>
	);
}
