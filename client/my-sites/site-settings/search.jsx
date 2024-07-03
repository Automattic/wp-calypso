import {
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	WPCOM_FEATURES_CLASSIC_SEARCH,
	WPCOM_FEATURES_INSTANT_SEARCH,
} from '@automattic/calypso-products';
import { CompactCard } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import Banner from 'calypso/components/banner';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { isFetchingSitePurchases } from 'calypso/state/purchases/selectors';
import isActivatingJetpackModule from 'calypso/state/selectors/is-activating-jetpack-module';
import isDeactivatingJetpackModule from 'calypso/state/selectors/is-deactivating-jetpack-module';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite, getJetpackSearchCustomizeUrl } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';

class Search extends Component {
	static defaultProps = {
		isSavingSettings: false,
		isRequestingSettings: true,
		fields: {},
	};

	static propTypes = {
		handleAutosavingToggle: PropTypes.func.isRequired,
		isSavingSettings: PropTypes.bool,
		isRequestingSettings: PropTypes.bool,
		fields: PropTypes.object,
		trackEvent: PropTypes.func.isRequired,
		activatingSearchModule: PropTypes.bool.isRequired,
		isLoading: PropTypes.bool,
		isSearchModuleActive: PropTypes.bool,
		siteId: PropTypes.number,
		translate: PropTypes.func.isRequired,
		saveJetpackSettings: PropTypes.func.isRequired,
		submitForm: PropTypes.func.isRequired,
		updateFields: PropTypes.func.isRequired,
	};

	renderLoadingPlaceholder() {
		return (
			<Banner
				title=""
				jetpack={ this.props.siteIsJetpack }
				disableHref
				description={ this.props.translate( 'Loading your purchases…' ) }
			/>
		);
	}

	renderInfoLink( link ) {
		return (
			<SupportInfo
				text={ this.props.translate( 'Highly relevant, fast, and customizable search results.' ) }
				link={ link }
				privacyLink={ false }
			/>
		);
	}

	renderSearchExplanation() {
		return (
			<FormSettingExplanation>
				{ this.props.translate(
					'Add the Search widget to your sidebar to configure advanced search filters.'
				) }
			</FormSettingExplanation>
		);
	}

	renderInstantSearchExplanation() {
		return (
			<div className="search__module-settings site-settings__child-settings">
				<FormSettingExplanation>
					{ this.props.translate(
						'Allow your visitors to get search results as soon as they start typing.'
					) }{ ' ' }
				</FormSettingExplanation>
			</div>
		);
	}

	renderSettingsUpdating() {
		return (
			<div className="search__module-settings site-settings__child-settings">
				<FormSettingExplanation>
					{ this.props.translate( 'Updating settings…' ) }
				</FormSettingExplanation>
			</div>
		);
	}

	renderUpgradeNotice() {
		const { siteSlug, translate, hasClassicSearch } = this.props;

		const href = `/checkout/${ siteSlug }/${ PRODUCT_JETPACK_SEARCH_MONTHLY }`;

		return (
			<Fragment>
				<UpsellNudge
					title={
						hasClassicSearch
							? translate( 'Upgrade your Jetpack Search and get the instant search experience' )
							: translate( 'Upgrade to Jetpack Search and get the instant search experience' )
					}
					description={ translate(
						'Incredibly powerful and customizable, Jetpack Search helps your visitors instantly find the right content – right when they need it.'
					) }
					href={ href }
					event="calypso_jetpack_search_settings_upgrade_nudge"
					feature={ WPCOM_FEATURES_INSTANT_SEARCH }
					plan={ PRODUCT_JETPACK_SEARCH_MONTHLY }
					showIcon
				/>
			</Fragment>
		);
	}

	renderSearchTogglesForJetpackSites() {
		const {
			isRequestingSettings,
			isSavingSettings,
			siteId,
			translate,
			isSearchModuleActive,
			saveJetpackSettings,
			fields,
			activatingSearchModule,
			isLoading,
			trackEvent,
			activateModule,
			hasInstantSearch,
		} = this.props;

		/**
		 * Call WPCOM endpoints to update remote Jetpack sites' settings
		 * @param {boolean} jetpackSearchEnabled Whether Jetpack Search is enabled
		 */
		const handleJetpackSearchToggle = ( jetpackSearchEnabled ) => {
			if ( hasInstantSearch ) {
				trackEvent( 'Toggled instant_search_enabled' );
				saveJetpackSettings( siteId, {
					instant_search_enabled: jetpackSearchEnabled,
				} );
			}
		};

		/**
		 * Call WPCOM endpoints to update remote Jetpack sites' settings
		 * @param {boolean} instantSearchEnabled Whether Instant Search is enabled
		 */
		const handleInstantSearchToggle = ( instantSearchEnabled ) => {
			trackEvent( 'Toggled instant_search_enabled' );
			if ( ! isSearchModuleActive ) {
				trackEvent( 'Toggled jetpack_search_enabled' );
				activateModule( siteId, 'search', true );
			}
			saveJetpackSettings( siteId, {
				instant_search_enabled: instantSearchEnabled,
			} );
		};

		return (
			<Fragment>
				<JetpackModuleToggle
					siteId={ siteId }
					moduleSlug="search"
					label={ translate( 'Enable Jetpack Search' ) }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleJetpackSearchToggle }
				/>
				{ this.props.hasInstantSearch && (
					<div className="site-settings__jetpack-instant-search-toggle">
						<ToggleControl
							checked={
								isSearchModuleActive &&
								this.props.hasInstantSearch &&
								!! fields.instant_search_enabled
							}
							disabled={ ! hasInstantSearch || isRequestingSettings || isSavingSettings }
							onChange={ handleInstantSearchToggle }
							label={ translate( 'Enable instant search experience (recommended)' ) }
						></ToggleControl>
						{ isLoading || activatingSearchModule || isSavingSettings
							? this.renderSettingsUpdating()
							: this.renderInstantSearchExplanation() }
					</div>
				) }
			</Fragment>
		);
	}

	renderSearchTogglesForSimpleSites() {
		const {
			fields,
			isRequestingSettings,
			isSavingSettings,
			translate,
			submitForm,
			updateFields,
			trackEvent,
			activatingSearchModule,
			isLoading,
			hasInstantSearch,
		} = this.props;

		/**
		 * Change instant toggle status with Jetpack Search toggle and then save settings
		 * @param {boolean} jetpackSearchEnabled Whether Jetpack Search is enabled
		 */
		const handleJetpackSearchToggle = ( jetpackSearchEnabled ) => {
			trackEvent( 'Toggled jetpack_search_enabled' );
			trackEvent( 'Toggled instant_search_enabled' );
			const jetpackFieldsToUpdate = {
				jetpack_search_enabled: jetpackSearchEnabled,
			};
			if ( hasInstantSearch ) {
				trackEvent( 'Toggled jetpack_search_enabled' );
				jetpackFieldsToUpdate.instant_search_enabled = jetpackSearchEnabled;
			}
			updateFields( jetpackFieldsToUpdate, submitForm );
		};

		const handleInstantSearchToggle = ( instantSearchEnabled ) => {
			trackEvent( 'Toggled instant_search_enabled' );
			const jetpackFieldsToUpdate = {
				instant_search_enabled: instantSearchEnabled,
			};
			if ( instantSearchEnabled && ! fields.jetpack_search_enabled ) {
				trackEvent( 'Toggled jetpack_search_enabled' );
				jetpackFieldsToUpdate.jetpack_search_enabled = true;
			}
			updateFields( jetpackFieldsToUpdate, submitForm );
		};

		return (
			<Fragment>
				<ToggleControl
					checked={ !! fields.jetpack_search_enabled }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleJetpackSearchToggle }
					label={ translate( 'Enable Jetpack Search' ) }
				></ToggleControl>
				{ /** Business plan could be simple sites too, unless user triggers certain actions  */ }
				{ this.props.hasInstantSearch && (
					<div className="site-settings__jetpack-instant-search-toggle">
						<ToggleControl
							checked={ !! fields.jetpack_search_enabled && !! fields.instant_search_enabled }
							disabled={ isRequestingSettings || isSavingSettings || ! hasInstantSearch }
							onChange={ handleInstantSearchToggle }
							label={ translate( 'Enable instant search experience (recommended)' ) }
						></ToggleControl>
						{ isLoading || activatingSearchModule || isSavingSettings
							? this.renderSettingsUpdating()
							: this.renderInstantSearchExplanation() }
					</div>
				) }
			</Fragment>
		);
	}

	renderSettingsCard() {
		const { fields, translate, siteIsJetpack, hasInstantSearch } = this.props;

		return (
			<Fragment>
				<CompactCard className="search__card site-settings__traffic-settings">
					{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
					<FormFieldset className="jetpack-search-settings">
						{ siteIsJetpack
							? this.renderSearchTogglesForJetpackSites()
							: this.renderSearchTogglesForSimpleSites() }
					</FormFieldset>
				</CompactCard>
				{ hasInstantSearch && fields.instant_search_enabled && (
					<CompactCard
						href={ this.props.jetpackSearchCustomizeUrl }
						target={ siteIsJetpack ? 'external' : null }
					>
						{ translate( 'Customize Search' ) }
					</CompactCard>
				) }
			</Fragment>
		);
	}

	render() {
		return (
			<div className="site-settings__search-block">
				{ this.props.siteId && <QueryJetpackConnection siteId={ this.props.siteId } /> }
				{ this.props.siteId && <QuerySitePurchases siteId={ this.props.siteId } /> }
				<SettingsSectionHeader title={ this.props.translate( 'Jetpack Search' ) }>
					{ this.renderInfoLink(
						this.props.hasInstantSearch
							? 'https://jetpack.com/support/search/'
							: this.props.upgradeLink
					) }
				</SettingsSectionHeader>
				{ this.props.isLoading ? (
					this.renderLoadingPlaceholder()
				) : (
					<>
						{ ( this.props.hasInstantSearch || this.props.isSearchEligible ) &&
							this.renderSettingsCard() }
						{ ! this.props.hasInstantSearch && this.renderUpgradeNotice() }
					</>
				) }
			</div>
		);
	}
}

export default connect( ( state, { isRequestingSettings } ) => {
	const siteId = getSelectedSiteId( state );
	const hasInstantSearch = siteHasFeature( state, siteId, WPCOM_FEATURES_INSTANT_SEARCH );
	const hasClassicSearch = siteHasFeature( state, siteId, WPCOM_FEATURES_CLASSIC_SEARCH );
	const isSearchEligible = hasClassicSearch || hasInstantSearch;
	const upgradeLink =
		'/checkout/' +
		getSelectedSiteSlug( state ) +
		'/jetpack_search_monthly?utm_campaign=site-settings&utm_source=calypso';
	const moduleSlug = 'search';
	const isSearchModuleActive = !! isJetpackModuleActive( state, siteId, moduleSlug );
	const activating = !! isActivatingJetpackModule( state, siteId, moduleSlug );
	const deactivating = !! isDeactivatingJetpackModule( state, siteId, moduleSlug );

	return {
		activatingSearchModule: activating || deactivating,
		hasInstantSearch,
		isSearchEligible,
		isLoading: isRequestingSettings || isFetchingSitePurchases( state ),
		jetpackSearchCustomizeUrl: getJetpackSearchCustomizeUrl( state, siteId ),
		site: getSelectedSite( state ),
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		siteIsJetpack: isJetpackSite( state, siteId ),
		upgradeLink,
		isSearchModuleActive:
			( isSearchModuleActive && ! deactivating ) || ( ! isSearchModuleActive && activating ),
		hasClassicSearch,
	};
} )( localize( Search ) );
