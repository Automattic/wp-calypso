/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import UrlPreview from 'blocks/url-preview';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';

class SitePreview extends Component {
	static propTypes = {
		showPreview: PropTypes.bool,
	};

	static defaultProps = {
		showPreview: false,
	};

	render() {
		return <UrlPreview showPreview={ this.props.showPreview } />;
	}
}

const mapStateToProps = state => ( {
	showPreview: getCurrentLayoutFocus( state ) === 'preview',
} );

export default connect( mapStateToProps )( SitePreview );
