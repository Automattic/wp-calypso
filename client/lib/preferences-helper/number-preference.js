/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

class NumberPreference extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		value: PropTypes.number.isRequired,
	};

	render() {
		const { name, value } = this.props;

		return (
			<ul className="preferences-helper__list">
				<li key={ name }>{ value.toString() }</li>
			</ul>
		);
	}
}

export default connect( null, null )( localize( NumberPreference ) );
