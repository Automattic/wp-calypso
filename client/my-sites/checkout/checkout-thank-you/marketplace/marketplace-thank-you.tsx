/**
 * External dependencies
 */
import React from 'react';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { isDesktop } from '@automattic/viewport';
import { ThemeProvider } from 'emotion-theming';

/**
 * Internal dependencies
 */
import Masterbar from 'calypso/layout/masterbar/masterbar';
import Item from 'calypso/layout/masterbar/item';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getPreviousPath from 'calypso/state/selectors/get-previous-path';
import yoastInstalledImage from 'calypso/assets/images/marketplace/yoast-installed.svg';
import theme from 'calypso/my-sites/plugins/marketplace/theme';
import type { MarketplaceThemeProps } from 'calypso/my-sites/plugins/marketplace/theme';
import {
	MarketplaceHeaderTitle,
	FullWidthButton,
} from 'calypso/my-sites/plugins/marketplace/components';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import useSiteMenuItems from 'calypso/my-sites/sidebar-unified/use-site-menu-items';
/**
 * style dependencies
 */
import './style.scss';

const MarketplaceThankYouContainer = styled.div< MarketplaceThemeProps >`
	background-color: #fff;
	overflow: scroll;
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
    margin-bottom: 50px;
}`;

const ThankYouBody = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	margin-top: 50px;
	> div {
		width: 460px;
		padding: 0 35px;
		> div {
			min-width: 144px;
		}
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

const MarketplaceThankYou = () => {
	const selectedSite = useSelector( getSelectedSite );
	const previousPath = useSelector( getPreviousPath );
	const menuItems = useSiteMenuItems();

	const { url: postsPageUrl } =
		menuItems.find( ( { slug }: { slug: string } ) => slug === 'edit-php' ) ?? {};

	const { url: yoastSeoPageUrl } =
		menuItems.find( ( { slug }: { slug: string } ) => slug === 'wpseo_dashboard' ) ?? {};

	const translate = useTranslate();
	const imageWidth = isDesktop() ? 200 : 150;

	return (
		<>
			<Masterbar>
				<Item
					icon="cross"
					onClick={ () =>
						previousPath
							? page( previousPath )
							: page(
									`/plugins/wordpress-seo${ selectedSite?.slug ? `/${ selectedSite.slug }` : '' }`
							  )
					}
					tooltip={ translate( 'Go to plugin' ) }
					tipTarget="close"
				/>
			</Masterbar>
			<MarketplaceThankYouContainer className="marketplace-thank-you__container">
				<MarketplaceThankYouHeader>
					<img alt="yoast logo" width={ imageWidth } src={ yoastInstalledImage }></img>
				</MarketplaceThankYouHeader>
				<ThankYouBody>
					<div>
						<MarketplaceThankyouSection>
							<MarketplaceHeaderTitle className="marketplace-thank-you__body-header wp-brand-font">
								{ translate( 'Yoast SEO Premium is installed' ) }
							</MarketplaceHeaderTitle>
							<p>{ translate( "You're all set. Yoast SEO is installed and ready to go." ) }</p>
						</MarketplaceThankyouSection>
						<MarketplaceThankyouSection>
							<MarketplaceHeaderTitle
								subtitle
								className="marketplace-thank-you__body-header wp-brand-font"
							>
								{ translate( 'What’s next?' ) }
							</MarketplaceHeaderTitle>
							<MarketplaceNextSteps>
								<h3>{ translate( 'Plugin setup' ) }</h3>
								<div>
									<p>
										{ translate(
											'Get to know Yoast SEO and customize it, so you can hit the ground running.'
										) }
									</p>
									<div>
										<FullWidthButton
											onClick={ () => ( window.location.href = yoastSeoPageUrl ) }
											primary
										>
											{ translate( 'Get started' ) }
										</FullWidthButton>
									</div>
								</div>
								<h3>{ translate( 'Start putting SEO to work' ) }</h3>
								<div>
									<p>
										{ translate(
											"Improve your site's performance and rank higher with a few tips."
										) }
									</p>
									<div>
										<FullWidthButton onClick={ () => ( window.location.href = postsPageUrl ) }>
											{ translate( 'View posts' ) }
										</FullWidthButton>
									</div>
								</div>
							</MarketplaceNextSteps>
						</MarketplaceThankyouSection>
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
								<VerticalNavItem path={ 'https://wordpress.com/support' }>
									{ translate( 'Support documentation' ) }
								</VerticalNavItem>
							</VerticalNav>
						</MarketplaceThankyouSection>
					</div>
				</ThankYouBody>
			</MarketplaceThankYouContainer>
		</>
	);
};

export default function MarketplaceWrapper() {
	return (
		<ThemeProvider theme={ theme }>
			<MarketplaceThankYou />
		</ThemeProvider>
	);
}
