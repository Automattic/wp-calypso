import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import { PREINSTALLED_PREMIUM_PLUGINS } from '../constants';
import CTAButton from './CTA-button';

export default function PluginDetailsCTAPreinstalledPremiumPlugins( {
	isPluginInstalledOnsite,
	plugin,
} ) {
	const translate = useTranslate();

	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, selectedSiteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSiteId ) );
	const isJetpackSelfHosted = selectedSiteId && isJetpack && ! isAtomic;
	const isSimple = selectedSiteId && ! isAtomic && ! isJetpack;
	const isSiteConnected = useSelector( ( state ) =>
		getSiteConnectionStatus( state, selectedSiteId )
	);
	const hasFeature = useSelector( ( state ) =>
		siteHasFeature( state, selectedSiteId, PREINSTALLED_PREMIUM_PLUGINS[ plugin.slug ].feature )
	);

	const managedPluginMessage = (
		<span className="plugin-details-CTA__preinstalled">
			{ translate( '%s is automatically managed for you.', { args: plugin.name } ) }
		</span>
	);
	const upgradeButton = (
		<Button
			className="plugin-details-CTA__install-button"
			href={ `/checkout/${ selectedSiteSlug }/${
				PREINSTALLED_PREMIUM_PLUGINS[ plugin.slug ].product
			}` }
			primary
		>
			{ translate( 'Upgrade %s', { args: plugin.name } ) }
		</Button>
	);
	const activateButton = (
		<CTAButton
			isJetpackSelfHosted={ isJetpackSelfHosted }
			isSiteConnected={ isSiteConnected }
			isPreinstalledPremiumPlugin
			plugin={ plugin }
			selectedSite={ selectedSite }
		/>
	);

	if ( isSimple && hasFeature ) {
		return managedPluginMessage;
	}
	if ( isSimple && ! hasFeature ) {
		return (
			<>
				{ managedPluginMessage }
				{ upgradeButton }
			</>
		);
	}

	if ( ! isSimple && ! isPluginInstalledOnsite ) {
		return { activateButton };
	}

	if ( ! isSimple && isPluginInstalledOnsite && ! hasFeature ) {
		return upgradeButton;
	}

	return null;
}
