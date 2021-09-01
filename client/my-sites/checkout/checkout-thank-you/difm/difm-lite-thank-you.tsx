import { ThemeProvider } from 'emotion-theming';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThankYou } from 'calypso/components/thank-you';
import Item from 'calypso/layout/masterbar/item';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import theme from 'calypso/my-sites/marketplace/theme';
import useSiteMenuItems from 'calypso/my-sites/sidebar-unified/use-site-menu-items';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { getIsRequestingAdminMenu } from 'calypso/state/admin-menu/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

function DIFMLiteThankYou() {
	const [ pollCount, setPollCount ] = useState( 0 );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const menuItems = useSiteMenuItems();
	const isRequestingMenu = useSelector( getIsRequestingAdminMenu );
	const { url: postsPageUrl } =
		menuItems.find( ( { slug }: { slug: string } ) => slug === 'edit-php' ) ?? {};

	const { url: yoastSeoPageUrl } =
		menuItems.find( ( { slug }: { slug: string } ) => slug === 'wpseo_dashboard' ) ?? {};

	useEffect( () => {
		if ( ! postsPageUrl || ! yoastSeoPageUrl ) {
			selectedSiteId && dispatch( requestAdminMenu( selectedSiteId ) );
		}
	}, [ dispatch, postsPageUrl, selectedSiteId, yoastSeoPageUrl ] );

	/* TODO: Make all these items product-dependent */
	const thankYouImage = {
		alt: 'DIFM logo',
		src: 'https://wpcom.files.wordpress.com/2020/10/built-by-hero-image.png',
	};

	const difmSetupSection = {
		sectionKey: 'difm_next_step',
		sectionTitle: translate( 'What’s next?' ),
		nextSteps: [
			{
				stepKey: 'difm_site_build',
				stepTitle: 'Site building',
				stepDescription: translate(
					'Our team will build an initial version of the site with the theme you selected'
				),
				stepCta: (
					<FullWidthButton
						href={ yoastSeoPageUrl }
						primary
						busy={ isRequestingMenu }
						disabled={ ! yoastSeoPageUrl }
					>
						Talk to one of our experts
					</FullWidthButton>
				),
			},
			{
				stepKey: 'difm_browse_themes',
				stepTitle: 'Find other themes',
				stepDescription:
					'Browse even more themes from our theme library which you can switch to any time',
				stepCta: (
					<FullWidthButton
						href={ postsPageUrl }
						busy={ isRequestingMenu }
						disabled={ ! yoastSeoPageUrl }
					>
						Browse Themes
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
			<ThankYou
				containerClassName="difm-thank-you"
				sections={ [ difmSetupSection ] }
				showSupportSection={ true }
				thankYouImage={ thankYouImage }
				thankYouTitle={ 'DIFM Project initiated' }
			/>
		</>
	);
}

export default function DIFMLiteThankYouWrapper(): JSX.Element {
	return (
		<ThemeProvider theme={ theme }>
			<DIFMLiteThankYou />
		</ThemeProvider>
	);
}
