/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { contextTypes } from '../context-types';

export default class Tour extends Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		version: PropTypes.string,
		path: PropTypes.oneOfType( [ PropTypes.string, PropTypes.arrayOf( PropTypes.string ) ] ),
		when: PropTypes.func,
	};

	static contextTypes = contextTypes;

	render() {
		const { children } = this.props;
		const { step } = this.context;
		const nextStep = Array.isArray( children )
			? find( children, ( stepComponent ) => stepComponent.props.name === step )
			: children;

		return nextStep || null;
	}
}
