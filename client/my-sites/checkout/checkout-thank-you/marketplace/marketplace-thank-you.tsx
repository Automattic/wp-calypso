import { ThemeProvider, Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import successImage from 'calypso/assets/images/marketplace/check-circle.svg';
import { ThankYou } from 'calypso/components/thank-you';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { useWPCOMPlugin } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import Item from 'calypso/layout/masterbar/item';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import theme from 'calypso/my-sites/marketplace/theme';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { requestLatestAtomicTransfer } from 'calypso/state/atomic/transfers/actions';
import { getLatestAtomicTransfer } from 'calypso/state/atomic/transfers/selectors';
import { pluginInstallationStateChange } from 'calypso/state/marketplace/purchase-flow/actions';
import { MARKETPLACE_ASYNC_PROCESS_STATUS } from 'calypso/state/marketplace/types';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import { getPluginOnSite, isRequesting } from 'calypso/state/plugins/installed/selectors';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { getPlugin, isFetched } from 'calypso/state/plugins/wporg/selectors';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const ThankYouContainer = styled.div`
	.marketplace-thank-you {
		margin-top: 72px;
		img {
			height: 74px;
		}
	}

	.thank-you__header-title {
		font-size: 44px;
	}

	.thank-you__header-subtitle {
		font-size: 16px;
		color: var( --studio-gray-60 );
	}
`;

const MasterbarStyled = styled( Masterbar )`
	--color-masterbar-background: var( --studio-white );
	--color-masterbar-text: var( --studio-gray-60 );
	border-bottom: 0;
`;

const WordPressLogoStyled = styled( WordPressLogo )`
	max-height: calc( 100% - 47px );
	align-self: center;
	fill: rgb( 54, 54, 54 );
`;

const ItemStyled = styled( Item )`
	cursor: pointer;
	font-size: 14px;
	font-weight: 500;
	padding: 0;
	justify-content: left;

	&:hover {
		background: var( --studio-white );
		text-decoration: underline;
	}

	.gridicon {
		height: 17px;
		fill: var( --studio-black );

		@media ( max-width: 480px ) {
			margin: 0;
		}
	}

	@media ( max-width: 480px ) {
		.masterbar__item-content {
			display: block;
		}
	}
`;

const AtomicTransferComplete = 'completed';

interface IProps {
	productSlug: string;
}

const MarketplaceThankYou = ( { productSlug }: IProps ): JSX.Element => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isRequestingPlugins = useSelector( ( state ) => isRequesting( state, siteId ) );
	const pluginOnSite = useSelector( ( state ) => getPluginOnSite( state, siteId, productSlug ) );
	const wporgPlugin = useSelector( ( state ) => getPlugin( state, productSlug ) );
	const isWporgPluginFetched = useSelector( ( state ) => isFetched( state, productSlug ) );
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const { transfer } = useSelector( ( state ) => getLatestAtomicTransfer( state, siteId ) );
	const [ pluginIcon, setPluginIcon ] = useState( '' );

	// Site is transferring to Atomic.
	// Poll the transfer status.
	useEffect( () => {
		if ( ! siteId || transfer?.status === AtomicTransferComplete ) {
			return;
		}
		waitFor( 2 ).then( () => dispatch( dispatch( requestLatestAtomicTransfer( siteId ) ) ) );
	}, [ siteId, dispatch, transfer ] );

	useEffect( () => {
		dispatch(
			pluginInstallationStateChange(
				MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED,
				'deauthorize plugin installation URL'
			)
		);
	}, [ dispatch ] );

	// retrieve wporg plugin data if not available
	useEffect( () => {
		if ( ! isWporgPluginFetched ) {
			dispatch( wporgFetchPluginData( productSlug ) );
		}
		if ( isWporgPluginFetched ) {
			// wporgPlugin exists in the wporg directory.
			setPluginIcon( wporgPlugin?.icon || successImage );
		}
	}, [ isWporgPluginFetched, productSlug, setPluginIcon, dispatch, wporgPlugin?.icon ] );

	useEffect( () => {
		if ( wporgPlugin?.wporg === false ) {
			// wporgPlugin exists and plugin doesn't exist in wporg directory.
			setPluginIcon( successImage );
		}
	}, [ wporgPlugin ] );

	// retrieve WPCom plugin data
	const { data: wpComPluginData } = useWPCOMPlugin( productSlug );

	// Site is already Atomic (or just transferred).
	// Poll the plugin installation status.
	useEffect( () => {
		if ( transfer?.status === AtomicTransferComplete && ! pluginOnSite && ! isRequestingPlugins ) {
			waitFor( 1 ).then( () => dispatch( fetchSitePlugins( siteId ) ) );
		}
		// Do not add retries in dependencies to avoid infinite loop.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isRequestingPlugins, pluginOnSite, dispatch, siteId, transfer ] );

	const thankYouImage = {
		alt: '',
		src: pluginIcon,
	};

	// Cast pluginOnSite's type because the return type of getPluginOnSite is
	// wrong and I don't know how to fix it. Remove this cast if the return type
	// can be made correct.
	const pluginOnSiteData = pluginOnSite as
		| undefined
		| { action_links?: { Settings?: string }; name?: string };

	const fallbackSetupUrl = wpComPluginData?.setup_url && siteAdminUrl + wpComPluginData?.setup_url;

	const setupURL =
		pluginOnSiteData?.action_links?.Settings || fallbackSetupUrl || `${ siteAdminUrl }plugins.php`;

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
					<FullWidthButton
						href={ setupURL }
						primary
						busy={ ! pluginOnSite || transfer?.status !== AtomicTransferComplete }
					>
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
					<FullWidthButton
						onClick={ () =>
							// Force reload the page.
							( document.location.href = `${ document.location.origin }/plugins/${ siteSlug }` )
						}
					>
						{ translate( 'Explore plugins' ) }
					</FullWidthButton>
				),
			},
		],
	};

	const thankYouSubtitle = translate( '%(pluginName)s has been installed.', {
		args: { pluginName: pluginOnSiteData?.name },
	} );

	return (
		<ThemeProvider theme={ theme }>
			{ /* Using Global to override Global masterbar height */ }
			<Global
				styles={ css`
					body.is-section-marketplace {
						--masterbar-height: 72px;
					}
				` }
			/>
			<MasterbarStyled>
				<WordPressLogoStyled />
				<ItemStyled
					icon="chevron-left"
					onClick={ () =>
						( document.location.href = `${ document.location.origin }/plugins/${ siteSlug }` )
					} // Force reload the page.
				>
					{ translate( 'Back to plugins' ) }
				</ItemStyled>
			</MasterbarStyled>
			<ThankYouContainer>
				<ThankYou
					containerClassName="marketplace-thank-you"
					sections={ [ setupSection ] }
					showSupportSection={ true }
					thankYouImage={ thankYouImage }
					thankYouTitle={ translate( 'All ready to go!' ) }
					thankYouSubtitle={ pluginOnSite && thankYouSubtitle }
					headerBackgroundColor="#fff"
					headerTextColor="#000"
				/>
			</ThankYouContainer>
		</ThemeProvider>
	);
};

export default MarketplaceThankYou;
