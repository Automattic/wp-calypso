import { ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import yoastInstalledImage from 'calypso/assets/images/marketplace/yoast-installed.svg';
import { ThankYou } from 'calypso/components/thank-you';
import Item from 'calypso/layout/masterbar/item';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import theme from 'calypso/my-sites/marketplace/theme';
import useSiteMenuItems from 'calypso/my-sites/sidebar-unified/use-site-menu-items';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import {
	isFetchingAutomatedTransferStatus,
	getAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/selectors';
import { getIsPluginInstalledDuringPurchase } from 'calypso/state/marketplace/purchase-flow/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const ThankYouContainer = styled.div`
	.marketplace-thank-you {
		margin-top: var( --masterbar-height );
		img {
			height: auto;
		}
	}
`;

const MarketplaceThankYouYoast = () => {
	const [ pollCount, setPollCount ] = useState( 0 );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const dispatch = useDispatch();

	const isFetchingTransferStatus = useSelector( ( state ) =>
		isFetchingAutomatedTransferStatus( state, selectedSiteId ?? 0 )
	);

	const isPluginInstalledDuringPurchase = useSelector( getIsPluginInstalledDuringPurchase );
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
	const thankYouImage = {
		alt: 'yoast logo',
		src: yoastInstalledImage,
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
		<>
			<Masterbar>
				<Item
					icon="cross"
					onClick={ () =>
						page( `/marketplace/product/details/wordpress-seo/${ selectedSiteSlug }` )
					}
					tooltip={ translate( 'Go to plugin' ) }
					tipTarget="close"
				/>
			</Masterbar>
			<ThankYouContainer>
				<ThankYou
					containerClassName="marketplace-thank-you"
					sections={ [ yoastSetupSection ] }
					showSupportSection={ true }
					thankYouImage={ thankYouImage }
					/* TODO: Change thank you message to be dynamic according to product */
					thankYouTitle={ translate( 'Yoast SEO Premium is installed' ) }
				/>
			</ThankYouContainer>
		</>
	);
};

export default function MarketplaceWrapper(): JSX.Element {
	return (
		<ThemeProvider theme={ theme }>
			<MarketplaceThankYouYoast />
		</ThemeProvider>
	);
}
