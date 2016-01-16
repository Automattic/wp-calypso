/**
 * External dependencies
 */
import React, { Component } from 'react';
import { Provider } from 'react-redux';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import ExporterContainer from 'my-sites/exporter';
import i18n from 'lib/mixins/i18n';

export default class SiteSettingsExport extends Component {
	render() {
		if ( this.props.site.jetpack ) {
			return (
				<EmptyContent
					illustration="/calypso/images/drake/drake-jetpack.svg"
					title={ i18n.translate( 'Want to export your site?' ) }
					line={ i18n.translate( `Visit your site's wp-admin for all your import and export needs.` ) }
					action={ i18n.translate( 'Export %(siteTitle)s', { args: { siteTitle: this.props.site.title } } ) }
					actionURL={ this.props.site.options.admin_url + 'export.php' }
					actionTarget="_blank"
				/>
			);
		}

		return (
			<Provider store={ this.props.store }>
				<ExporterContainer site={ this.props.site } />
			</Provider>
		);
	}
}
