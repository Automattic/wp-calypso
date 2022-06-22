import { WPCOM_FEATURES_INSTANT_SEARCH } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import PreinstalledCTA from './preinstalled-cta';

export default function PluginDetailsCTAJetpackSearch( { pluginName } ) {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const hasInstantSearch = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_INSTANT_SEARCH )
	);
	const wpAdminUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'admin.php?page=jetpack-search' )
	);

	const translate = useTranslate();

	const buttonLabel = hasInstantSearch
		? translate( 'Settings' )
		: translate( 'Settings (Upgrades available)' );

	const buttonHref = isAtomic ? wpAdminUrl : `/settings/performance/${ siteSlug }`;

	return (
		<div className="plugin-details-CTA__container">
			<PreinstalledCTA pluginName={ pluginName } />
			<div className="plugin-details-CTA__jetpack-search">
				<Button className="plugin-details-CTA__install-button" href={ buttonHref } primary>
					{ buttonLabel }
				</Button>
			</div>
		</div>
	);
}
