/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

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
import {
	getJetpackModule,
	isActivatingJetpackModule,
	isJetpackModuleActive,
} from 'state/selectors';
import { isJetpackSite } from 'state/sites/selectors';

class Sitemaps extends Component {
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

	isSitePublic() {
		const { fields } = this.props;
		return parseInt( fields.blog_public ) === 1;
	}

	renderSitemapLink( sitemapUrl ) {
		return (
			<div key={ sitemapUrl }>
				<ExternalLink href={ sitemapUrl } icon target="_blank">
					{ sitemapUrl }
				</ExternalLink>
			</div>
		);
	}

	renderInfoLink( url ) {
		const { translate } = this.props;

		return (
			<div className="sitemaps__info-link-container site-settings__info-link-container">
				<InfoPopover position="left">
					<ExternalLink href={ url } icon target="_blank">
						{ translate( 'Learn more about Sitemaps.' ) }
					</ExternalLink>
				</InfoPopover>
			</div>
		);
	}

	renderSitemapExplanation() {
		const { translate } = this.props;

		return (
			<FormSettingExplanation>
				{ translate(
					'Your sitemap is automatically sent to all major search engines for indexing.'
				) }
			</FormSettingExplanation>
		);
	}

	renderNonPublicExplanation() {
		const { siteSlug, translate } = this.props;

		return (
			<FormSettingExplanation>
				{ translate(
					'Your site is not currently accessible to search engines. ' +
						'You must set your {{a}}privacy settings{{/a}} to "public".',
					{
						components: {
							a: <a href={ '/settings/general/' + siteSlug } />,
						},
					}
				) }
			</FormSettingExplanation>
		);
	}

	renderWpcomSettings() {
		const { site } = this.props;
		const sitemapTypes = [ 'sitemap', 'news-sitemap' ];

		return (
			<div>
				{ this.renderInfoLink( 'https://support.wordpress.com/sitemaps/' ) }

				{ this.isSitePublic() ? (
					<div>
						{ this.renderSitemapExplanation() }
						{ sitemapTypes.map( sitemapType => {
							const sitemapUrl = site.URL + '/' + sitemapType + '.xml';
							return this.renderSitemapLink( sitemapUrl );
						} ) }
					</div>
				) : (
					this.renderNonPublicExplanation()
				) }
			</div>
		);
	}

	renderJetpackSettingsContent() {
		const {
			activatingSitemapsModule,
			sitemapsModule,
			sitemapsModuleActive,
			translate,
		} = this.props;

		if ( ! this.isSitePublic() && ! activatingSitemapsModule ) {
			return (
				<div className="sitemaps__module-settings site-settings__child-settings">
					{ this.renderNonPublicExplanation() }
				</div>
			);
		}

		if ( ! activatingSitemapsModule && ! sitemapsModuleActive ) {
			return;
		}

		const sitemapTypes = [ 'sitemap_url', 'news_sitemap_url' ];

		return (
			<div className="sitemaps__module-settings site-settings__child-settings">
				{ activatingSitemapsModule && (
					<FormSettingExplanation>{ translate( 'Generating sitemap…' ) }</FormSettingExplanation>
				) }

				{ sitemapsModuleActive && (
					<div>
						{ this.renderSitemapExplanation() }

						{ sitemapsModule &&
							sitemapTypes.map(
								sitemapType =>
									sitemapsModule.extra[ sitemapType ] &&
									this.renderSitemapLink( sitemapsModule.extra[ sitemapType ] )
							) }
					</div>
				) }
			</div>
		);
	}

	renderJetpackSettings() {
		const { isRequestingSettings, isSavingSettings, siteId, translate } = this.props;

		return (
			<FormFieldset>
				{ this.renderInfoLink( 'https://jetpack.com/support/sitemaps' ) }

				<JetpackModuleToggle
					siteId={ siteId }
					moduleSlug="sitemaps"
					label={ translate( 'Generate XML sitemaps' ) }
					disabled={ isRequestingSettings || isSavingSettings || ! this.isSitePublic() }
				/>

				{ this.renderJetpackSettingsContent() }
			</FormFieldset>
		);
	}

	render() {
		const { siteId, siteIsJetpack, translate } = this.props;

		return (
			<div>
				{ siteId && <QueryJetpackConnection siteId={ siteId } /> }

				<SectionHeader label={ translate( 'Sitemaps' ) } />

				<Card className="sitemaps__card site-settings__traffic-settings">
					{ siteIsJetpack ? this.renderJetpackSettings() : this.renderWpcomSettings() }
				</Card>
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		activatingSitemapsModule: !! isActivatingJetpackModule( state, siteId, 'sitemaps' ),
		site: getSelectedSite( state ),
		siteSlug: getSelectedSiteSlug( state ),
		siteIsJetpack: isJetpackSite( state, siteId ),
		sitemapsModule: getJetpackModule( state, siteId, 'sitemaps' ),
		sitemapsModuleActive: !! isJetpackModuleActive( state, siteId, 'sitemaps' ),
	};
} )( localize( Sitemaps ) );
