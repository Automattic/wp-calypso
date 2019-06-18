/**
 * External dependencies
 */
import { Children, Component } from 'react';
import PropTypes from 'prop-types';

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
		const nextStep =
			Children.count( children ) > 1
				? Children.toArray( children ).find( stepComponent => stepComponent.props.name === step )
				: children;

		return nextStep || null;
	}
}
