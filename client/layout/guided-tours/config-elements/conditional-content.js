/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import contextTypes from '../context-types';

export default class ConditionalContent extends PureComponent {
	static propTypes = {
		when: PropTypes.func.isRequired,
	};

	static contextTypes = contextTypes;

	render() {
		const { isValid } = this.context;

		if ( ! isValid( this.props.when ) ) {
			return null;
		}

		return this.props.children;
	}
}
