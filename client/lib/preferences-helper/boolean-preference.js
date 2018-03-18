/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

class BooleanPreference extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		value: PropTypes.bool.isRequired,
	};

	render() {
		const { name, value, translate } = this.props;

		return (
			<ul className="preferences-helper__list">
				<li key={ name }>{ value ? translate( 'True' ) : translate( 'False' ) }</li>
			</ul>
		);
	}
}

export default connect( null, null )( localize( BooleanPreference ) );
