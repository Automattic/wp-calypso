import { Card } from '@automattic/components';
import { isJetpackSite } from '@automattic/data-stores/src/site/selectors';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { PanelHeading, PanelSection } from 'calypso/sites/components/panel';
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isHostingMenuUntangled } from '../utils';

const Masterbar = ( {
	isRequestingSettings,
	isSavingSettings,
	selectedSiteId,
	masterbarModuleUnavailable,
	translate,
} ) => {
	const siteIsJetpack = useSelectedSiteSelector( isJetpackSite );
	const siteIsAtomic = useSelectedSiteSelector( isSiteAutomatedTransfer );

	const isNonAtomicJetpackSite = siteIsJetpack && ! siteIsAtomic;

	if ( ! isNonAtomicJetpackSite ) {
		// Masterbar can't be turned off on Atomic sites - don't show the toggle in that case)
		return null;
	}

	const renderForm = () => {
		return (
			<>
				<FormFieldset>
					<SupportInfo
						text={ translate(
							'Adds a toolbar with links to all your sites, notifications, ' +
								'your WordPress.com profile, and the Reader.'
						) }
						link="https://jetpack.com/support/masterbar/"
					/>
					<JetpackModuleToggle
						siteId={ selectedSiteId }
						moduleSlug="masterbar"
						label={ translate( 'Enable the WordPress.com toolbar' ) }
						description={ translate(
							'The WordPress.com toolbar replaces the default WordPress admin toolbar. ' +
								'It offers one-click access to notifications, your WordPress.com profile and ' +
								'your other Jetpack and WordPress.com websites. You can also catch up on the sites ' +
								'you follow in the Reader.'
						) }
						disabled={ isRequestingSettings || isSavingSettings || masterbarModuleUnavailable }
					/>
				</FormFieldset>
			</>
		);
	};

	if ( ! isHostingMenuUntangled() ) {
		return (
			<div>
				<QueryJetpackConnection siteId={ selectedSiteId } />

				<SettingsSectionHeader title={ translate( 'WordPress.com toolbar' ) } />
				<Card className="masterbar__card site-settings__security-settings">{ renderForm() }</Card>
			</div>
		);
	}

	return (
		<PanelSection>
			<QueryJetpackConnection siteId={ selectedSiteId } />
			<PanelHeading>{ translate( 'WordPress.com toolbar' ) }</PanelHeading>
			{ renderForm() }
		</PanelSection>
	);
};

Masterbar.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
};

Masterbar.propTypes = {
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
};

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
	const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
		state,
		selectedSiteId,
		'masterbar'
	);

	return {
		selectedSiteId,
		masterbarModuleUnavailable: siteInDevMode && moduleUnavailableInDevMode,
	};
} )( localize( Masterbar ) );
