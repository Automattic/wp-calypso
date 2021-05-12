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
					{ this.props.hasSearchProduct
						? this.props.translate(
								'If deactivated, Jetpack Search will still optimize your search results but visitors will have to submit a search query before seeing any results.'
						  )
						: // The following notice is only shown for Business/Pro plan holders.
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

	renderSettingsCard() {
		const {
			activatingSearchModule,
			fields,
			handleAutosavingToggle,
			isLoading,
			isRequestingSettings,
			isSavingSettings,
			isSearchModuleActive,
			siteId,
			translate,
		} = this.props;

		return (
			<Fragment>
				<CompactCard className="search__card site-settings__traffic-settings">
					{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
					<FormFieldset className="jetpack-search-settings">
						{ this.props.siteIsJetpack ? (
							<JetpackModuleToggle
								siteId={ siteId }
								moduleSlug="search"
								label={ translate( 'Improve built-in WordPress search performance.' ) }
								disabled={ isRequestingSettings || isSavingSettings }
							/>
						) : (
							<FormToggle
								checked={ !! fields.jetpack_search_enabled }
								disabled={ isRequestingSettings || isSavingSettings }
								onChange={ handleAutosavingToggle( 'jetpack_search_enabled' ) }
							>
								{ translate( 'Improve built-in WordPress search performance.' ) }
							</FormToggle>
						) }

						<div className="site-settings__jetpack-instant-search-toggle">
							<FormToggle
								checked={ !! fields.instant_search_enabled }
								disabled={
									isRequestingSettings ||
									isSavingSettings ||
									! ( isSearchModuleActive || fields.jetpack_search_enabled ) ||
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
					</FormFieldset>
				</CompactCard>
				{ fields.instant_search_enabled && (
					<CompactCard
						href={ this.props.customizerUrl }
						target={ this.props.siteIsJetpack ? 'external' : null }
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

	return {
		activatingSearchModule:
			!! isActivatingJetpackModule( state, siteId, 'search' ) ||
			!! isDeactivatingJetpackModule( state, siteId, 'search' ),
		customizerUrl: getCustomizerUrl( state, siteId, 'jetpack_search' ),
		hasSearchProduct,
		isSearchEligible,
		isSearchModuleActive: !! isJetpackModuleActive( state, siteId, 'search' ),
		isLoading: isRequestingSettings || isFetchingSitePurchases( state ),
		site: getSelectedSite( state ),
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		siteIsJetpack: isJetpackSite( state, siteId ),
		upgradeLink,
	};
} )( localize( Search ) );
