import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import { ACTIVATE_PLUGIN, DEACTIVATE_PLUGIN } from 'calypso/lib/plugins/constants';
import { getSoftwareSlug } from 'calypso/lib/plugins/utils';
import { togglePluginActivation } from 'calypso/state/plugins/installed/actions';
import {
	getPluginOnSite,
	isPluginActionInProgress,
} from 'calypso/state/plugins/installed/selectors';
import { isMarketplaceProduct as isMarketplaceProductSelector } from 'calypso/state/products-list/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export const ActivationButton = ( { plugin, active } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, plugin.slug )
	);
	const softwareSlug = getSoftwareSlug( plugin, isMarketplaceProduct );

	// Site type
	const selectedSite = useSelector( getSelectedSite );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, selectedSite?.ID ) );
	const sitePlugin = useSelector( ( state ) =>
		getPluginOnSite( state, selectedSite?.ID, softwareSlug )
	);

	const jetpackNonAtomic = isJetpack && ! isAtomic;
	const hasManagePlugins = useSelector(
		( state ) =>
			siteHasFeature( state, selectedSite?.ID, WPCOM_FEATURES_MANAGE_PLUGINS ) || jetpackNonAtomic
	);
	const autoManagedPlugins = [ 'jetpack', 'vaultpress', 'akismet' ];
	const isManagedPlugin = isAtomic && autoManagedPlugins.includes( softwareSlug );
	const canManagePlugins = ( isJetpack && ! isAtomic ) || ( isAtomic && hasManagePlugins );

	const activationInProgress = useSelector( ( state ) =>
		isPluginActionInProgress( state, selectedSite?.ID, plugin.id, [
			ACTIVATE_PLUGIN,
			DEACTIVATE_PLUGIN,
		] )
	);

	return (
		<Button
			onClick={ () => dispatch( togglePluginActivation( selectedSite?.ID, sitePlugin ) ) }
			disabled={ activationInProgress || isManagedPlugin || ! canManagePlugins }
		>
			{ active ? translate( 'Deactivate' ) : translate( 'Activate' ) }
		</Button>
	);
};
