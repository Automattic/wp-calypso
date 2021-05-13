/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { overSome } from 'lodash';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import FormToggle from 'calypso/components/forms/form-toggle';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SupportInfo from 'calypso/components/support-info';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import isActivatingJetpackModule from 'calypso/state/selectors/is-activating-jetpack-module';
import isDeactivatingJetpackModule from 'calypso/state/selectors/is-deactivating-jetpack-module';
import { getSitePurchases, isFetchingSitePurchases } from 'calypso/state/purchases/selectors';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { isJetpackSite, getCustomizerUrl } from 'calypso/state/sites/selectors';
import {
	isBusiness,
	isEnterprise,
	isVipPlan,
	isJetpackBusiness,
	isEcommerce,
	isJetpackSearch,
	isP2Plus,
	planHasJetpackSearch,
	FEATURE_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
} from '@automattic/calypso-products';

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
					{ ! this.props.hasSearchProduct && // The following notice is only shown for Business/Pro plan holders.
						this.props.translate(
							'Instant search is only available with a Jetpack Search subscription.'
						) }
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
		const { siteIsJetpack, siteSlug, translate } = this.props;

		const href = siteIsJetpack
			? `/checkout/${ siteSlug }/${ PRODUCT_JETPACK_SEARCH_MONTHLY }`
			: `/checkout/${ siteSlug }/${ PRODUCT_WPCOM_SEARCH_MONTHLY }`;

		return (
			<Fragment>
				<UpsellNudge
					title={ translate( 'Keep people reading and buying' ) }
					description={ translate(
						'Incredibly powerful and customizable, Jetpack Search helps your visitors instantly find the right content – right when they need it.'
					) }
					href={ href }
					event={ 'calypso_jetpack_search_settings_upgrade_nudge' }
					feature={ FEATURE_SEARCH }
					plan={ siteIsJetpack ? PRODUCT_JETPACK_SEARCH_MONTHLY : PRODUCT_WPCOM_SEARCH_MONTHLY }
					showIcon={ true }
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
		} = this.props;

		/**
		 * Call WPCOM endpoints to update remote Jetpack sites' settings
		 *
		 * @param {boolean} jetpackSearchEnabled Whether Jetpack Search is enabled
		 */
		const handleInstantSearchToggle = ( jetpackSearchEnabled ) => {
			trackEvent( 'Toggled instant_search_enabled' );
			saveJetpackSettings( siteId, {
				instant_search_enabled: jetpackSearchEnabled,
			} );
		};

		return (
			<Fragment>
				<JetpackModuleToggle
					siteId={ siteId }
					moduleSlug="search"
					label={ translate( 'Enable Jetpack Search' ) }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleInstantSearchToggle }
				/>

				<div className="site-settings__jetpack-instant-search-toggle">
					<FormToggle
						checked={ isSearchModuleActive && !! fields.instant_search_enabled }
						disabled={
							isRequestingSettings ||
							isSavingSettings ||
							! isSearchModuleActive ||
							! this.props.hasSearchProduct
						}
						onChange={ handleInstantSearchToggle }
					>
						{ translate( 'Enable instant search experience (recommended)' ) }
					</FormToggle>
					{ isLoading || activatingSearchModule || isSavingSettings
						? this.renderSettingsUpdating()
						: this.renderInstantSearchExplanation() }
				</div>
			</Fragment>
		);
	}

	renderSearchTogglesForSimpleSites() {
		const {
			fields,
			handleAutosavingToggle,
			isRequestingSettings,
			isSavingSettings,
			translate,
			submitForm,
			updateFields,
			trackEvent,
			activatingSearchModule,
			isLoading,
		} = this.props;

		/**
		 * Change instant toggle status with Jetpack Search toggle and then save settings
		 *
		 * @param {boolean} jetpackSearchEnabled Whether Jetpack Search is enabled
		 */
		const handleJetpackSearchToggle = ( jetpackSearchEnabled ) => {
			trackEvent( 'Toggled jetpack_search_enabled' );
			trackEvent( 'Toggled instant_search_enabled' );
			updateFields(
				{
					instant_search_enabled: jetpackSearchEnabled,
					jetpack_search_enabled: jetpackSearchEnabled,
				},
				submitForm
			);
		};

		return (
			<Fragment>
				<FormToggle
					checked={ !! fields.jetpack_search_enabled }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleJetpackSearchToggle }
				>
					{ translate( 'Enable Jetpack Search' ) }
				</FormToggle>

				<div className="site-settings__jetpack-instant-search-toggle">
					<FormToggle
						checked={ !! fields.instant_search_enabled }
						disabled={
							isRequestingSettings ||
							isSavingSettings ||
							! fields.jetpack_search_enabled ||
							! this.props.hasSearchProduct
						}
						onChange={ handleAutosavingToggle( 'instant_search_enabled' ) }
					>
						{ translate( 'Enable instant search experience (recommended)' ) }
					</FormToggle>
					{ isLoading || activatingSearchModule || isSavingSettings
						? this.renderSettingsUpdating()
						: this.renderInstantSearchExplanation() }
				</div>
			</Fragment>
		);
	}

	renderSettingsCard() {
		const { fields, translate, siteIsJetpack } = this.props;

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
				{ fields.instant_search_enabled && (
					<CompactCard
						href={ this.props.customizerUrl }
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
						this.props.hasSearchProduct
							? 'https://jetpack.com/support/search/'
							: this.props.upgradeLink
					) }
				</SettingsSectionHeader>
				{ ( this.props.hasSearchProduct || this.props.isSearchEligible ) &&
					this.renderSettingsCard() }
				{ ! this.props.hasSearchProduct && this.renderUpgradeNotice() }
			</div>
		);
	}
}

const hasBusinessPlan = overSome( isJetpackBusiness, isBusiness, isEnterprise, isEcommerce );
const checkForSearchProduct = ( purchase ) =>
	purchase.active && ( isJetpackSearch( purchase ) || isP2Plus( purchase ) );
export default connect( ( state, { isRequestingSettings } ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const hasSearchProduct =
		getSitePurchases( state, siteId ).find( checkForSearchProduct ) ||
		planHasJetpackSearch( site.plan?.product_slug );
	const isSearchEligible =
		( site && site.plan && ( hasBusinessPlan( site.plan ) || isVipPlan( site.plan ) ) ) ||
		!! hasSearchProduct;
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
		customizerUrl: getCustomizerUrl( state, siteId, 'jetpack_search' ),
		hasSearchProduct,
		isSearchEligible,
		isLoading: isRequestingSettings || isFetchingSitePurchases( state ),
		site: getSelectedSite( state ),
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		siteIsJetpack: isJetpackSite( state, siteId ),
		upgradeLink,
		isSearchModuleActive:
			( isSearchModuleActive && ! deactivating ) || ( ! isSearchModuleActive && activating ),
	};
} )( localize( Search ) );
