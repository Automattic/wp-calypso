/**
 * External dependencies
 */
import React, { Component } from 'react';
/**
 * Internal dependencies
 */
import ExporterContainer from 'my-sites/exporter';

export default class SiteSettingsExport extends Component {
	render() {
		return <ExporterContainer site={ this.props.site } />;
	}
}
