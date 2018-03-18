/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

class ArrayPreference extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		value: PropTypes.array.isRequired,
	};

	render() {
		const { value } = this.props;

		return (
			<ul className="preferences-helper__list">
				{ value.map( ( preference, index ) => (
					<li key={ index }>{ JSON.stringify( preference ) }</li>
				) ) }
			</ul>
		);
	}
}

export default connect( null, null )( localize( ArrayPreference ) );
