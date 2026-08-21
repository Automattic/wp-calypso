import { WordPressLogo } from '@automattic/components';
import { css, Global, ThemeProvider } from '@emotion/react';
import clsx from 'clsx';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MarketplaceProgressBar from 'calypso/my-sites/marketplace/components/progressbar';
import theme from 'calypso/my-sites/marketplace/theme';
import './style.scss';
import MarketplaceInstallHelpLink from './help-link';
import HonestInstallCard from './honest-progress/card';
import { getWaitVariant } from './honest-progress/get-wait-variant';
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

	// The honest wait narrates the real transfer stages, so it only applies to the path that
	// runs a transfer; every other path keeps the classic bar.
	const waitVariant = isTransferWait ? getWaitVariant() : 'control';

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
				<WordPressLogo className="marketplace-plugin-install__logo" size={ 24 } />
				{ waitVariant !== 'control' && <MarketplaceInstallHelpLink /> }
			</Masterbar>
			<div
				className={ clsx( 'marketplace-plugin-install__root', {
					'is-top-aligned': waitVariant === 'honest_progress',
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
				{ ! error && waitVariant === 'honest_progress' && (
					<HonestInstallCard
						transferStatus={ transferStatus }
						currentStep={ currentStep }
						startedAt={ transferStartedAt }
					/>
				) }
				{ ! error && waitVariant === 'control' && (
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
