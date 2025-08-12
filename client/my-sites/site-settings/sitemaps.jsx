import { ExternalLink } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { PanelCard, PanelCardHeading } from 'calypso/components/panel';
import SupportInfo from 'calypso/components/support-info';
import JetpackModuleToggle from 'calypso/my-sites/site-settings/jetpack-module-toggle';
import getJetpackModule from 'calypso/state/selectors/get-jetpack-module';
import isActivatingJetpackModule from 'calypso/state/selectors/is-activating-jetpack-module';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';

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
		let url;
		try {
			url = new URL( sitemapUrl );
		} catch ( error ) {
			return null;
		}

		url.protocol = 'https:';
		const secureSitemap = url.toString();

		return (
			<div key={ secureSitemap }>
				<ExternalLink
					href={ secureSitemap }
					icon
					target="_blank"
					style={ { overflowWrap: 'anywhere' } }
				>
					{ secureSitemap }
				</ExternalLink>
			</div>
		);
	}

	renderInfoLink( link, privacyLink ) {
		const { translate } = this.props;

		return (
			<SupportInfo
				text={ translate(
					'Automatically generates the files required for search engines to index your site.'
				) }
				link={ link }
				privacyLink={ privacyLink }
			/>
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
							a: <a href={ '/sites/settings/site/' + siteSlug } />,
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
				{ this.isSitePublic() ? (
					<div>
						{ this.renderSitemapExplanation() }
						{ sitemapTypes.map( ( sitemapType ) => {
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
		const { activatingSitemapsModule, sitemapsModule, sitemapsModuleActive, translate } =
			this.props;

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
								( sitemapType ) =>
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
			<PanelCard>
				{ siteId && <QueryJetpackConnection siteId={ siteId } /> }

				<PanelCardHeading>
					{ translate( 'Sitemaps' ) }
					{ siteIsJetpack
						? this.renderInfoLink( 'https://jetpack.com/support/sitemaps/' )
						: this.renderInfoLink(
								localizeUrl( 'https://wordpress.com/support/sitemaps/' ),
								false
						  ) }
				</PanelCardHeading>

				{ siteIsJetpack ? this.renderJetpackSettings() : this.renderWpcomSettings() }
			</PanelCard>
		);
	}
}

export default connect( ( state ) => {
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
