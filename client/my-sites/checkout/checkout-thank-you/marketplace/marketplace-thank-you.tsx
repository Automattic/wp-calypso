import { ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import successImage from 'calypso/assets/images/marketplace/success.png';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import { ThankYou } from 'calypso/components/thank-you';
import Item from 'calypso/layout/masterbar/item';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import theme from 'calypso/my-sites/marketplace/theme';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const ThankYouContainer = styled.div`
	.marketplace-thank-you {
		margin-top: var( --masterbar-height );
		img {
			height: auto;
		}
	}
`;

const MarketplaceThankYou = ( { productSlug } ): JSX.Element => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const plugin = useSelector( ( state ) => getPluginOnSite( state, siteId, productSlug ) );
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );

	const thankYouImage = {
		alt: '',
		src: successImage,
	};

	const setupURL = plugin?.action_links?.Settings
		? plugin.action_links.Settings
		: `${ siteAdminUrl }plugins.php`;

	const setupSection = {
		sectionKey: 'setup_whats_next',
		sectionTitle: translate( 'What’s next?' ),
		nextSteps: [
			{
				stepKey: 'whats_next_plugin_setup',
				stepTitle: translate( 'Plugin setup' ),
				stepDescription: translate(
					'Get to know your plugin and customize it, so you can hit the ground running.'
				),
				stepCta: (
					<FullWidthButton href={ setupURL } primary busy={ ! plugin }>
						{ translate( 'Manage plugin' ) }
					</FullWidthButton>
				),
			},
			{
				stepKey: 'whats_next_grow',
				stepTitle: translate( 'Keep growing' ),
				stepDescription: translate(
					'Take your site to the next level. We have all the solutions to help you grow and thrive.'
				),
				stepCta: (
					<FullWidthButton href={ `/plugins/${ siteSlug }` }>
						{ translate( 'Explore plugins' ) }
					</FullWidthButton>
				),
			},
		],
	};

	const thankYouSubtitle = translate( '%(pluginName)s has been installed.', {
		args: { pluginName: plugin?.name },
	} );

	return (
		<ThemeProvider theme={ theme }>
			{ siteId && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
			<Masterbar>
				<Item
					icon="cross"
					onClick={ () => page( `/plugins/${ siteSlug }` ) }
					tooltip={ translate( 'Go to home' ) }
					tipTarget="close"
				/>
			</Masterbar>
			<ThankYouContainer>
				<ThankYou
					containerClassName="marketplace-thank-you"
					sections={ [ setupSection ] }
					showSupportSection={ true }
					thankYouImage={ thankYouImage }
					thankYouTitle={ translate( 'All ready to go!' ) }
					thankYouSubtitle={ plugin && thankYouSubtitle }
				/>
			</ThankYouContainer>
		</ThemeProvider>
	);
};

export default MarketplaceThankYou;
