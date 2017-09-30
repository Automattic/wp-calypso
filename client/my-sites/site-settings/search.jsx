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
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getJetpackModule, isActivatingJetpackModule, isJetpackModuleActive } from 'state/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import {
	// isBusiness,
	// isEnterprise,
	isJetpackBusiness
} from 'lib/products-values';

const hasBusinessPlan = overSome( isJetpackBusiness ); // isBusiness, isEnterprise, // uncomment for Atomic

class Search extends Component {
	static defaultProps = {
		isSavingSettings: false,
		isRequestingSettings: true,
		fields: {},
	};

	static propTypes = {
		isSavingSettings: PropTypes.bool,
		isRequestingSettings: PropTypes.bool,
		fields: PropTypes.object,
	};

	renderInfoLink( url ) {
		const { translate } = this.props;

		return (
			<div className="search__info-link-container site-settings__info-link-container">
				<InfoPopover position="left">
					<ExternalLink href={ url } icon target="_blank">
						{ translate( 'Learn more about Search.' ) }
					</ExternalLink>
				</InfoPopover>
			</div>
		);
	}

	renderSearchExplanation() {
		const { translate } = this.props;

		return (
			<FormSettingExplanation>
				{ translate( 'Your site is using enhanced search powered by Elasticsearch.' ) }
			</FormSettingExplanation>
		);
	}

	renderWpcomSettings() {
		return (
			<div>
				{ this.renderInfoLink( 'https://support.wordpress.com/search/' ) }

				<div>
					{ this.renderSearchExplanation() }
				</div>
			</div>
		);
	}

	renderJetpackSettingsContent() {
		const {
			activatingSearchModule,
			searchModuleActive,
			translate
		} = this.props;

		return (
			<div className="search__module-settings site-settings__child-settings">
				{
					activatingSearchModule &&
					<FormSettingExplanation>
						{ translate( 'Activating search…' ) }
					</FormSettingExplanation>
				}

				{
					searchModuleActive &&
					<div>
						{ this.renderSearchExplanation() }
					</div>
				}
			</div>
		);
	}

	renderJetpackSettings() {
		const {
			isRequestingSettings,
			isSavingSettings,
			siteId,
			translate
		} = this.props;

		return (
			<FormFieldset>
				{ this.renderInfoLink( 'https://jetpack.com/support/search' ) }

				<JetpackModuleToggle
					siteId={ siteId }
					moduleSlug="search"
					label={ translate( 'Enable site-wide search powered by Elasticsearch' ) }
					disabled={ isRequestingSettings || isSavingSettings }
				/>

				{ this.renderJetpackSettingsContent() }
			</FormFieldset>
		);
	}

	render() {
		const {
			siteId,
			siteIsJetpack,
			enableFeature,
			translate
		} = this.props;

		// for now, don't even show upgrade nudge
		if ( ! enableFeature ) {
			return null;
		}

		// don't show for WPCOM, for now
		if ( ! siteIsJetpack ) {
			return null;
		}

		return (
			<div>
				{ siteId && <QueryJetpackConnection siteId={ siteId } /> }

				<SectionHeader label={ translate( 'Search' ) } />

				<Card className="search__card site-settings__traffic-settings">
					{ siteIsJetpack
						? this.renderJetpackSettings()
						: this.renderWpcomSettings()
					}
				</Card>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );
		const isSearchEligible = site && site.plan && hasBusinessPlan( site.plan );

		return {
			siteId,
			activatingSearchModule: !! isActivatingJetpackModule( state, siteId, 'search' ),
			enableFeature: isSearchEligible,
			site: getSelectedSite( state ),
			siteSlug: getSelectedSiteSlug( state ),
			siteIsJetpack: isJetpackSite( state, siteId ),
			searchModule: getJetpackModule( state, siteId, 'search' ),
			searchModuleActive: !! isJetpackModuleActive( state, siteId, 'search' ),
		};
	}
)( localize( Search ) );
