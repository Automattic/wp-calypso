/**
 * External dependencies
 */
import React, { Component } from 'react';
import { Provider } from 'react-redux';

/**
 * Internal dependencies
 */
import ExporterContainer from 'my-sites/exporter';

export default class SiteSettingsExport extends Component {
	render() {
		return (
			<Provider store={ this.props.store }>
				<ExporterContainer site={ this.props.site } />
			</Provider>
		);
	}
}
