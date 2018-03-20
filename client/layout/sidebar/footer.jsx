/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

class SidebarFooter extends Component {
	render() {
		if ( ! this.props.children ) {
			return null;
		}
		return <div className="sidebar__footer">{ this.props.children }</div>;
	}
}

export default connect()( localize( SidebarFooter ) );
