/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { overSome } from 'lodash';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import SettingsSectionHeader from 'my-sites/site-settings/settings-section-header';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import SupportInfo from 'components/support-info';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import isActivatingJetpackModule from 'state/selectors/is-activating-jetpack-module';
import isDeactivatingJetpackModule from 'state/selectors/is-deactivating-jetpack-module';
import Banner from 'components/banner';
import isJetpackModuleActive from 'state/selectors/is-jetpack-module-active';
import { isJetpackSite, getCustomizerUrl } from 'state/sites/selectors';
import {
	isBusiness,
	isEnterprise,
	isVipPlan,
	isJetpackBusiness,
	isEcommerce,
} from 'lib/products-values';
import { FEATURE_SEARCH, PLAN_BUSINESS, PLAN_JETPACK_BUSINESS } from 'lib/plans/constants';
const hasBusinessPlan = overSome( isJetpackBusiness, isBusiness, isEnterprise, isEcommerce );

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
		const { translate } = this.props;

		return (
			<SupportInfo
				text={ translate(
					'Replaces the default WordPress search with a faster, filterable search experience.'
				) }
				link={ link }
				privacyLink={ false }
			/>
		);
	}

	renderSearchExplanation() {
		const { translate } = this.props;

		return (
			<FormSettingExplanation>
				{ translate(
					'Add the Search widget to your sidebar to configure advanced search filters.'
				) }
			</FormSettingExplanation>
		);
	}

	renderSettingsContent( updatingSettings, searchActive ) {
		const { translate } = this.props;

		return (
			<div className="search__module-settings site-settings__child-settings">
				{ updatingSettings && (
					<FormSettingExplanation>{ translate( 'Updating settings…' ) }</FormSettingExplanation>
				) }
				{ searchActive && ! updatingSettings ? (
					<div>{ this.renderSearchExplanation() }</div>
				) : null }
			</div>
		);
	}

	renderWPComSettings() {
		const {
			isRequestingSettings,
			isSavingSettings,
			fields,
			handleAutosavingToggle,
			translate,
		} = this.props;

		return (
			<FormFieldset>
				{ this.renderInfoLink( 'https://support.wordpress.com/jetpack-search/' ) }

				<CompactFormToggle
					checked={ !! fields.jetpack_search_enabled }
					disabled={ isRequestingSettings || isSavingSettings }
					onChange={ handleAutosavingToggle( 'jetpack_search_enabled' ) }
				>
					{ translate( 'Replace WordPress built-in search with an improved search experience' ) }
				</CompactFormToggle>

				{ this.renderSettingsContent( isSavingSettings, fields.jetpack_search_enabled ) }
			</FormFieldset>
		);
	}

	renderJetpackSettings() {
		const {
			isRequestingSettings,
			isSavingSettings,
			activatingSearchModule,
			searchModuleActive,
			siteId,
			translate,
		} = this.props;

		return (
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<FormFieldset className="jetpack-search-settings">
				{ this.renderInfoLink( 'https://jetpack.com/support/search/' ) }

				<JetpackModuleToggle
					siteId={ siteId }
					moduleSlug="search"
					label={ translate(
						'Replace WordPress built-in search with an improved search experience'
					) }
					disabled={ isRequestingSettings || isSavingSettings }
				/>

				{ this.renderSettingsContent( activatingSearchModule, searchModuleActive ) }
			</FormFieldset>
		);
	}

	render() {
		const {
			siteId,
			siteIsJetpack,
			isSearchEligible,
			searchModuleActive,
			fields,
			translate,
			customizerUrl,
		} = this.props;

		// for now, don't even show upgrade nudge
		if ( ! fields.jetpack_search_supported && ! isSearchEligible ) {
			const upgradeTitle = siteIsJetpack
				? translate( 'Add faster, more advanced searching to your site with Jetpack Professional' )
				: translate(
						'Add faster, more advanced searching to your site with WordPress.com Business'
				  );
			return (
				<div>
					<SettingsSectionHeader title={ translate( 'Jetpack Search' ) } />

					<Banner
						description={
							<div>
								<p>
									{ translate(
										'The built-in WordPress search is great for sites without much content. But as your site grows, searches slow down and return less relevant results.'
									) }
								</p>
								<p>
									{ translate(
										'Jetpack Search replaces the built-in search with a fast, scalable, customizable, and highly-relevant search hosted in the WordPress.com cloud. The result: Your users find the content they want, faster.'
									) }
								</p>
							</div>
						}
						event={ 'calypso_jetpack_search_settings_upgrade_nudge' }
						feature={ FEATURE_SEARCH }
						plan={ siteIsJetpack ? PLAN_JETPACK_BUSINESS : PLAN_BUSINESS }
						title={ upgradeTitle }
					/>
				</div>
			);
		}

		return (
			<div className="site-settings__search-block">
				{ siteId && <QueryJetpackConnection siteId={ siteId } /> }

				<SettingsSectionHeader title={ translate( 'Jetpack Search' ) } />

				<CompactCard className="search__card site-settings__traffic-settings">
					{ siteIsJetpack ? this.renderJetpackSettings() : this.renderWPComSettings() }
				</CompactCard>
				{ ( searchModuleActive || fields.jetpack_search_enabled ) && (
					<CompactCard href={ customizerUrl } target={ siteIsJetpack ? 'external' : null }>
						{ translate( 'Add Search Widget' ) }
					</CompactCard>
				) }
			</div>
		);
	}
}

export default connect( state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const isSearchEligible =
		site && site.plan && ( hasBusinessPlan( site.plan ) || isVipPlan( site.plan ) );

	return {
		siteId,
		activatingSearchModule:
			!! isActivatingJetpackModule( state, siteId, 'search' ) ||
			!! isDeactivatingJetpackModule( state, siteId, 'search' ),
		isSearchEligible: isSearchEligible,
		site: getSelectedSite( state ),
		siteSlug: getSelectedSiteSlug( state ),
		siteIsJetpack: isJetpackSite( state, siteId ),
		searchModuleActive: !! isJetpackModuleActive( state, siteId, 'search' ),
		customizerUrl: getCustomizerUrl( state, siteId ),
	};
} )( localize( Search ) );
