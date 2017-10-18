/**
 * External dependencies
 *
 * @format
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

class Show extends PureComponent {
	render() {
		return <p>{ this.props.translate( 'show!' ) }</p>;
	}
}

export default connect()( localize( Show ) );
