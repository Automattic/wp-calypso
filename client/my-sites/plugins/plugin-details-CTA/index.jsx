import { isBusiness, isEcommerce, isEnterprise } from '@automattic/calypso-products';
import { Button, Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import page from 'page';
import { useSelector, useDispatch } from 'react-redux';
import { userCan } from 'calypso/lib/site/utils';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import { isRequestingForSites } from 'calypso/state/plugins/installed/selectors';
import {
	getEligibility,
	isEligibleForAutomatedTransfer,
} from 'calypso/state/automated-transfer/selectors';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { default as checkVipSite } from 'calypso/state/selectors/is-vip-site';
import './style.scss';

const PluginDetailsCTA = ( props ) => {
    const translate = useTranslate();
	const { pluginSlug, selectedSite, isPluginInstalledOnsite, siteIds } = props;

	const requestingPluginsForSites = useSelector( ( state ) =>
		isRequestingForSites( state, siteIds )
	);

	// Site type
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const isVip = useSelector( ( state ) => checkVipSite( state, selectedSite?.ID ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, selectedSite?.ID ) );
	const isJetpackSelfHosted = selectedSite && isJetpack && ! isAtomic;

	// Eligibilities for Simple Sites.
	const { eligibilityHolds, eligibilityWarnings } = useSelector( ( state ) =>
		getEligibility( state, selectedSite?.ID )
	);
	const isEligible = useSelector( ( state ) =>
		isEligibleForAutomatedTransfer( state, selectedSite?.ID )
	);
	const hasEligibilityMessages =
		! isJetpack && ( eligibilityHolds || eligibilityWarnings || isEligible );

	if ( requestingPluginsForSites ) {
		// Display nothing if we are still requesting the plugin status.
		return null;
	}
	if ( ! isJetpackSelfHosted && ! isCompatiblePlugin( pluginSlug ) ) {
		// Check for WordPress.com compatibility.
		return null;
	}

	if ( ! selectedSite || ! userCan( 'manage_options', selectedSite ) ) {
		// Check if user can manage plugins.
		return null;
	}

	if ( isPluginInstalledOnsite ) {
		// Check if already instlaled on the site
		return null;
	}

	return (
		<div className="plugin-details-CTA__container plugin-details__header">
			<div className="plugin-details-CTA__price">{ translate( 'Free' ) }</div>
			<div className="plugin-details-CTA__install">
				<CTAButton
					slug={ pluginSlug }
					isPluginInstalledOnsite={ isPluginInstalledOnsite }
					isJetpackSelfHosted={ isJetpackSelfHosted }
					selectedSite={ selectedSite }
					isJetpack={ isJetpack }
					isVip={ isVip }
					hasEligibilityMessages={ hasEligibilityMessages }
				/>
			</div>
			<div className="plugin-details-CTA__t-and-c">
				{ translate(
					'By installing, you agree to {{a}}WordPress.com’s Terms of Service{{/a}} and the Third-Party plugin Terms.',
					{
						components: {
							a: <a target="_blank" rel="noopener noreferrer" href="https://wordpress.com/tos/" />,
						},
					}
				) }
			</div>
		</div>
	);
};

const CTAButton = ( { slug, selectedSite, isJetpack, isVip, hasEligibilityMessages } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ showEligibility, setShowEligibility ] = useState( false );

	const shouldUpgrade = ! (
		isBusiness( selectedSite.plan ) ||
		isEnterprise( selectedSite.plan ) ||
		isEcommerce( selectedSite.plan ) ||
		isJetpack ||
		isVip
	);

	return (
		<>
			<Dialog
				isVisible={ showEligibility }
				title={ translate( 'Eligibility' ) }
				onClose={ () => setShowEligibility( false ) }
			>
				<EligibilityWarnings
					standaloneProceed
					onProceed={ () =>
						onClickInstallPlugin( {
							dispatch,
							selectedSite,
							slug,
							upgradeAndInstall: shouldUpgrade,
						} )
					}
				/>
			</Dialog>
			<Button
				className="plugin-details-CTA__install-button"
				onClick={ () => {
					if ( hasEligibilityMessages ) {
						return setShowEligibility( true );
					}
					onClickInstallPlugin( {
						dispatch,
						selectedSite,
						slug,
						upgradeAndInstall: shouldUpgrade,
					} );
				} }
			>
				{ shouldUpgrade ? translate( 'Upgrade and install' ) : translate( 'Install and activate' ) }
			</Button>
		</>
	);
};

function onClickInstallPlugin( { dispatch, selectedSite, slug, upgradeAndInstall } ) {
	dispatch( removePluginStatuses( 'completed', 'error' ) );

	dispatch( recordGoogleEvent( 'Plugins', 'Install on selected Site', 'Plugin Name', slug ) );
	dispatch(
		recordGoogleEvent( 'calypso_plugin_install_click_from_plugin_info', {
			site: selectedSite?.ID,
			plugin: slug,
		} )
	);

	const installPluginURL = `/marketplace/${ slug }/install/${ selectedSite.slug }`;
	if ( upgradeAndInstall ) {
		page( `/checkout/${ selectedSite.slug }/business?redirect_to=${ installPluginURL }#step2` );
	} else {
		page( installPluginURL );
	}
}

export default PluginDetailsCTA;
