import { WordPressWordmark } from '@automattic/components';
import { css, Global, ThemeProvider } from '@emotion/react';
import clsx from 'clsx';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import TransferWaitCard from 'calypso/components/transfer-wait/card';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MarketplaceProgressBar from 'calypso/my-sites/marketplace/components/progressbar';
import theme from 'calypso/my-sites/marketplace/theme';
import './style.scss';
import MarketplaceInstallHelpLink from './help-link';
import ProductInstallErrorView from './product-install-error';
import { useProductInstall } from './use-product-install';

const MarketplaceProductInstall = ( {
	pluginSlug = '',
	themeSlug = '',
}: {
	pluginSlug?: string;
	themeSlug?: string;
} ) => {
	const {
		siteId,
		currentStep,
		steps,
		additionalSteps,
		error,
		errorTrackingProps,
		isTransferWait,
		transferStatus,
		transferStartedAt,
		onActivateTheme,
	} = useProductInstall( {
		pluginSlug,
		themeSlug,
	} );

	return (
		<ThemeProvider theme={ theme }>
			<PageViewTracker
				path="/marketplace/(plugin/theme)/:productSlug?/install/:site?"
				title="Marketplace Product > Installing"
			/>
			<QueryActiveTheme siteId={ siteId } />
			{ siteId && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
			<Masterbar className="marketplace-plugin-install__masterbar">
				<Global
					styles={ css`
						body {
							--masterbar-height: 72px;
						}
					` }
				/>
				<WordPressWordmark className="marketplace-plugin-install__logo" />
				{ isTransferWait && <MarketplaceInstallHelpLink /> }
			</Masterbar>
			<div
				className={ clsx( 'marketplace-plugin-install__root', {
					'is-top-aligned': isTransferWait,
				} ) }
			>
				{ error && (
					<ProductInstallErrorView
						error={ error }
						pluginSlug={ pluginSlug }
						themeSlug={ themeSlug }
						trackingProps={ errorTrackingProps }
						onActivateTheme={ onActivateTheme }
					/>
				) }
				{ ! error && isTransferWait && (
					// Keyed by product: an SPA navigation from one install to the next keeps this
					// component mounted, and the wait's clock and furthest stage belong to one install.
					<TransferWaitCard
						key={ pluginSlug || themeSlug }
						transferStatus={ transferStatus }
						fallbackStep={ currentStep }
						startedAt={ transferStartedAt }
					/>
				) }
				{ ! error && ! isTransferWait && (
					<MarketplaceProgressBar
						steps={ steps }
						currentStep={ currentStep }
						additionalSteps={ additionalSteps }
					/>
				) }
			</div>
		</ThemeProvider>
	);
};

export default MarketplaceProductInstall;
