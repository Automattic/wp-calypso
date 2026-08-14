import { isEnabled } from '@automattic/calypso-config';
import { WordPressLogo } from '@automattic/components';
import { css, Global, ThemeProvider } from '@emotion/react';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MarketplaceProgressBar from 'calypso/my-sites/marketplace/components/progressbar';
import theme from 'calypso/my-sites/marketplace/theme';
import './style.scss';
import HonestInstallProgress from './honest-progress';
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
		atomicFlow,
		transferStatus,
		onActivateTheme,
	} = useProductInstall( {
		pluginSlug,
		themeSlug,
	} );

	// The honest wait narrates the real transfer stages, so it only applies to the path that
	// runs a transfer; every other path keeps the classic bar.
	const showHonestProgress = atomicFlow && isEnabled( 'marketplace-honest-install-progress' );

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
			</Masterbar>
			<div className="marketplace-plugin-install__root">
				{ error && (
					<ProductInstallErrorView
						error={ error }
						pluginSlug={ pluginSlug }
						themeSlug={ themeSlug }
						onActivateTheme={ onActivateTheme }
					/>
				) }
				{ ! error && showHonestProgress && (
					<HonestInstallProgress transferStatus={ transferStatus } currentStep={ currentStep } />
				) }
				{ ! error && ! showHonestProgress && (
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
