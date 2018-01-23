/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { overSome, get } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import SectionHeader from 'components/section-header';
import JetpackModuleToggle from 'my-sites/site-settings/jetpack-module-toggle';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import untrailingslashit from 'lib/route/untrailingslashit';
import {
	getJetpackModule,
	isActivatingJetpackModule,
	isJetpackModuleActive,
} from 'state/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { isBusiness, isEnterprise, isVipPlan, isJetpackBusiness } from 'lib/products-values';

const hasBusinessPlan = overSome( isJetpackBusiness, isBusiness, isEnterprise );

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
				{ translate(
					'Add the Search widget to your sidebar to configure advanced search filters.'
				) }
			</FormSettingExplanation>
		);
	}

	renderSettingsContent() {
		const { activatingSearchModule, searchModuleActive, translate } = this.props;

		return (
			<div className="search__module-settings site-settings__child-settings">
				{ activatingSearchModule && (
					<FormSettingExplanation>{ translate( 'Activating search…' ) }</FormSettingExplanation>
				) }

				{ searchModuleActive && <div>{ this.renderSearchExplanation() }</div> }
			</div>
		);
	}

	renderSettings() {
		const { isRequestingSettings, isSavingSettings, siteId, translate } = this.props;

		return (
			<FormFieldset>
				{ this.renderInfoLink( 'https://jetpack.com/support/search' ) }

				<JetpackModuleToggle
					siteId={ siteId }
					moduleSlug="search"
					label={ translate(
						'Replace WordPress built-in search with an improved search experience'
					) }
					disabled={ isRequestingSettings || isSavingSettings }
				/>

				{ this.renderSettingsContent() }
			</FormFieldset>
		);
	}

	render() {
		const {
			siteId,
			site,
			siteIsJetpack,
			enableFeature,
			searchModuleActive,
			translate,
		} = this.props;

		// for now, don't even show upgrade nudge
		if ( ! enableFeature ) {
			return null;
		}

		// don't show for regular WPCOM sites, for now
		if ( ! siteIsJetpack ) {
			return null;
		}

		let widgetURL = get( site, 'options.admin_url', '' );
		if ( widgetURL ) {
			widgetURL = untrailingslashit( widgetURL ) + '/widgets.php';
		}

		return (
			<div>
				{ siteId && <QueryJetpackConnection siteId={ siteId } /> }

				<SectionHeader label={ translate( 'Search' ) } />

				<CompactCard className="search__card site-settings__traffic-settings">
					{ this.renderSettings() }
				</CompactCard>
				{ searchModuleActive && (
					<CompactCard href={ widgetURL }>{ translate( 'Add Search Widget' ) }</CompactCard>
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
		activatingSearchModule: !! isActivatingJetpackModule( state, siteId, 'search' ),
		enableFeature: isSearchEligible,
		site: getSelectedSite( state ),
		siteSlug: getSelectedSiteSlug( state ),
		siteIsJetpack: isJetpackSite( state, siteId ),
		searchModule: getJetpackModule( state, siteId, 'search' ),
		searchModuleActive: !! isJetpackModuleActive( state, siteId, 'search' ),
	};
} )( localize( Search ) );
