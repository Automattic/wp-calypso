/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class ArrayPreference extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		value: PropTypes.array.isRequired,
	};

	render() {
		const { value } = this.props;

		return (
			<ul className="preferences-helper__array-preference">
				{ value.map( ( preference, index ) => (
					<li key={ index }>{ JSON.stringify( preference ) }</li>
				) ) }
			</ul>
		);
	}
}
