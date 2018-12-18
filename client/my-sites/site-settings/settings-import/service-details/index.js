/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get, flow, includes, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import FormButton from 'components/forms/form-button';
import TextInput from 'components/forms/form-text-input';
import { jpTestSubmitUrl } from 'state/jetpack-importer-test/actions';
import WordPress from './wordpress';
import Wix from './wix';
import Medium from './medium';
import Blogger from './blogger';
import Squarespace from './squarespace';

const serviceComponents = {
	wix: Wix,
	wordpress: WordPress,
	blogger: Blogger,
	medium: Medium,
	squarespace: Squarespace,
};

class ServiceDetails extends Component {
	render() {
		const {
			jetpackImporterTest: { requesting = false, detectedService = null } = {},
			site,
		} = this.props;

		const ServiceComponent = get( serviceComponents, detectedService, null );

		return (
			<div className="site-importer__site-importer-pane">
				{ ServiceComponent && <ServiceComponent site={ site } /> }
			</div>
		);
	}
}

export default flow(
	connect( state => ( {
		jetpackImporterTest: get( state, 'jetpackImporterTest' ),
		site: getSelectedSite( state ),
	} ) ),
	localize
)( ServiceDetails );
