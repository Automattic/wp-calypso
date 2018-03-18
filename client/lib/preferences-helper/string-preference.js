/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

class StringPreference extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		value: PropTypes.string.isRequired,
	};

	render() {
		const { name, value } = this.props;

		return (
			<ul className="preferences-helper__list">
				<li key={ name }>{ value }</li>
			</ul>
		);
	}
}

export default connect( null, null )( localize( StringPreference ) );
