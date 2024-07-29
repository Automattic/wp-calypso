import { PRODUCT_JETPACK_SCAN, WPCOM_FEATURES_SCAN } from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { UpsellNudge } from 'calypso/blocks/upsell-nudge';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { activateModule } from 'calypso/state/jetpack/modules/actions';
import getJetpackModule from 'calypso/state/selectors/get-jetpack-module';
import isFetchingJetpackModules from 'calypso/state/selectors/is-fetching-jetpack-modules';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';
import isJetpackSiteInDevelopmentMode from 'calypso/state/selectors/is-jetpack-site-in-development-mode';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import AllowList from './allow-list';
import Protect from './protect';
import SettingsSectionHeader from './settings-section-header';

class Firewall extends Component {
	static propTypes = {
		fields: PropTypes.object.isRequired,
		handleSubmitForm: PropTypes.func.isRequired,
		isAtomic: PropTypes.bool.isRequired,
		isRequestingSettings: PropTypes.bool.isRequired,
		isSavingSettings: PropTypes.bool.isRequired,
		isSimple: PropTypes.bool.isRequired,
		isVip: PropTypes.bool.isRequired,
		onChangeField: PropTypes.func.isRequired,
		setFieldValue: PropTypes.func.isRequired,
		settings: PropTypes.object.isRequired,
	};

	static defaultProps = {
		isSavingSettings: false,
		isRequestingSettings: true,
		fields: {},
		settings: {},
	};

	disableForm() {
		return this.props.isRequestingSettings || this.props.isSavingSettings;
	}

	wafModuleSupported = () => {
		return (
			! this.props.firewallModuleUnavailable &&
			! this.props.isAtomic &&
			! this.props.isVip &&
			! this.props.isSimple
		);
	};

	disableWafForm = () => {
		return this.disableForm() || ! this.wafModuleSupported();
	};

	ensureWafModuleActive = () => {
		if ( this.wafModuleSupported() && ! this.props.firewallModuleActive ) {
			this.props.activateModule( this.props.selectedSiteId, 'waf', true );
		}
	};

	hasAutomaticRulesInstalled = () => {
		return !! this.props.settings.jetpack_waf_automatic_rules_last_updated_timestamp;
	};

	canUpdateAutomaticRules = () => {
		return this.props.hasRequiredFeature || this.hasAutomaticRulesInstalled();
	};

	automaticRulesLastUpdated = () => {
		const timestamp = parseInt(
			this.props.settings.jetpack_waf_automatic_rules_last_updated_timestamp
		);
		if ( timestamp ) {
			return moment( timestamp * 1000 ).format( 'MMMM D, YYYY h:mm A' );
		}
		return '';
	};

	handleAutomaticRulesToggle = ( event ) => {
		this.ensureWafModuleActive();
		this.props.handleAutosavingToggle( 'jetpack_waf_automatic_rules' )( event );
	};

	handleBlockListToggle = ( event ) => {
		this.ensureWafModuleActive();
		this.props.handleAutosavingToggle( 'jetpack_waf_ip_block_list_enabled' )( event );
	};

	handleSubmitForm = ( event ) => {
		this.ensureWafModuleActive();
		return this.props.handleSubmitForm( event );
	};

	render() {
		const {
			dirtyFields,
			disableProtect,
			fields,
			handleAutosavingToggle,
			hasRequiredFeature,
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
			selectedSiteId,
			selectedSiteSlug,
			setFieldValue,
			settings,
			translate,
		} = this.props;

		return (
			<div className="site-settings__security-settings site-settings__firewall-settings">
				<QueryJetpackConnection siteId={ selectedSiteId } />

				<SettingsSectionHeader
					title={ translate( 'Web Application Firewall (WAF)' ) }
					isSaving={ this.disableForm() }
					showButton
					onButtonClick={ this.handleSubmitForm }
					disabled={ this.disableForm() || dirtyFields.length === 0 }
				/>

				{ /* Automatic Rules */ }
				{ this.wafModuleSupported() && this.canUpdateAutomaticRules() && (
					<Card>
						<FormFieldset>
							<ToggleControl
								disabled={ this.disableWafForm() }
								onChange={ this.handleAutomaticRulesToggle }
								checked={ hasRequiredFeature ? !! fields.jetpack_waf_automatic_rules : false }
								label={ translate( 'Enable automatic firewall protection' ) }
							/>
							{ this.automaticRulesLastUpdated() && (
								<FormSettingExplanation isIndented>
									{ translate( 'Automatic security rules installed. Last updated on %(date)s.', {
										args: {
											date: this.automaticRulesLastUpdated(),
										},
									} ) }
								</FormSettingExplanation>
							) }
							<FormSettingExplanation isIndented>
								{ translate(
									'Block untrusted traffic sources by scanning every request made to your site. Jetpack’s advanced security rules are automatically kept up-to-date to protect your site from the latest threats.'
								) }
							</FormSettingExplanation>
						</FormFieldset>
					</Card>
				) }

				{ /* Upgrade Prompt */ }
				{ ! hasRequiredFeature && this.wafModuleSupported() && (
					<UpsellNudge
						className="site-settings__security-settings-firewall-nudge"
						title={
							this.hasAutomaticRulesInstalled()
								? translate( 'Your site is not receiving the latest updates to automatic rules' )
								: translate( 'Set up automatic rules with one click' )
						}
						description={
							this.hasAutomaticRulesInstalled()
								? translate( 'Upgrade to keep your site secure with up-to-date firewall rules' )
								: translate( 'Upgrade to enable automatic firewall protection.' )
						}
						event="calypso_scan_settings_upgrade_nudge"
						feature={ WPCOM_FEATURES_SCAN }
						showIcon
						href={ `/checkout/${ selectedSiteSlug }/${ PRODUCT_JETPACK_SCAN }?redirect_to=/settings/security/${ selectedSiteSlug }` }
						forceDisplay
						isJetpack
					/>
				) }

				{ /* Brute Force Login Protection */ }
				<Protect
					disableProtect={ disableProtect }
					fields={ fields }
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
					onChangeField={ onChangeField }
					setFieldValue={ setFieldValue }
				/>

				{ /* IP Block List */ }
				{ this.wafModuleSupported() && settings.jetpack_waf_ip_block_list_enabled !== undefined && (
					<Card>
						<FormFieldset>
							<ToggleControl
								disabled={ this.disableWafForm() }
								onChange={ this.handleBlockListToggle }
								checked={ !! fields.jetpack_waf_ip_block_list_enabled }
								label={ translate( 'Block specific IP addresses' ) }
							/>
							<FormSettingExplanation isIndented>
								{ translate(
									'IP addresses added to this list will be blocked from accessing your site.'
								) }
							</FormSettingExplanation>
							{ fields.jetpack_waf_ip_block_list_enabled && (
								<div className="site-settings__child-settings">
									<FormTextarea
										id="jetpack_waf_ip_block_list"
										value={ fields.jetpack_waf_ip_block_list }
										onChange={ onChangeField( 'jetpack_waf_ip_block_list' ) }
										disabled={ this.disableWafForm() || ! fields.jetpack_waf_ip_block_list_enabled }
										placeholder={ translate( 'Example: 12.12.12.1-12.12.12.100' ) }
									/>
								</div>
							) }
						</FormFieldset>
					</Card>
				) }

				{ /* IP Allow List */ }
				<AllowList
					fields={ fields }
					handleAutosavingToggle={ handleAutosavingToggle }
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
					onChangeField={ onChangeField }
					setFieldValue={ setFieldValue }
					settings={ settings }
				/>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const selectedSiteSlug = getSelectedSiteSlug( state );
		const selectedSiteId = getSelectedSiteId( state );
		const moduleDetails = getJetpackModule( state, selectedSiteId, 'waf' );
		const moduleDetailsLoading = isFetchingJetpackModules( state, selectedSiteId );
		const moduleDetailsNotLoaded = moduleDetails === null;
		const siteInDevMode = isJetpackSiteInDevelopmentMode( state, selectedSiteId );
		const moduleUnavailableInDevMode = isJetpackModuleUnavailableInDevelopmentMode(
			state,
			selectedSiteId,
			'waf'
		);
		const hasRequiredFeature = siteHasFeature( state, selectedSiteId, WPCOM_FEATURES_SCAN );

		return {
			selectedSiteId,
			selectedSiteSlug,
			firewallModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'waf' ),
			firewallModuleUnavailable:
				( moduleDetailsNotLoaded && ! moduleDetailsLoading ) ||
				( siteInDevMode && moduleUnavailableInDevMode ),
			hasRequiredFeature,
		};
	},
	{
		activateModule,
	}
)( localize( Firewall ) );
