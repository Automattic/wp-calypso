import {
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	WPCOM_FEATURES_INSTANT_SEARCH,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import PreinstalledCTA from './preinstalled-cta';

export default function PluginDetailsCTAJetpackSearch( { pluginName } ) {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isJetpackSelfHosted = siteId && isJetpack && ! isAtomic;
	const hasInstantSearch = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_INSTANT_SEARCH )
	);
	const translate = useTranslate();

	return (
		<div className="plugin-details-CTA__jetpack-search">
			{ ! isJetpackSelfHosted && <PreinstalledCTA pluginName={ pluginName } /> }
			{ ! hasInstantSearch && (
				<Button
					className="plugin-details-CTA__install-button"
					href={ `/checkout/${ siteSlug }/${ PRODUCT_JETPACK_SEARCH_MONTHLY }` }
					primary
				>
					{ translate( 'Upgrade Jetpack Search' ) }
				</Button>
			) }
		</div>
	);
}
