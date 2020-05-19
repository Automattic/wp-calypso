/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';

/**
 * Style dependencies
 */
import './style.scss';

export default class AsyncLoad extends Component {
	static propTypes = {
		placeholder: PropTypes.node,
		require: PropTypes.func.isRequired,
	};

	static defaultProps = {
		placeholder: <div className="async-load__placeholder" />,
	};

	constructor() {
		super( ...arguments );

		this.state = {
			require: null,
			component: null,
		};
	}

	componentDidMount = () => {
		this.mounted = true;
		this.require();
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.mounted && this.props.require !== nextProps.require ) {
			this.setState( { component: null } );
		}
	}

	componentDidUpdate( prevProps ) {
		// Our Babel transform will hoist the require function in the rendering
		// component, so we can compare the reference with confidence
		if ( this.props.require !== prevProps.require ) {
			this.require();
		}
	}

	componentWillUnmount() {
		this.mounted = false;
	}

	require() {
		const requireFunction = this.props.require;

		requireFunction( ( component ) => {
			if ( this.mounted && this.props.require === requireFunction ) {
				this.setState( { component } );
			}
		} );
	}

	render() {
		if ( this.state.component ) {
			const props = omit( this.props, [ 'placeholder', 'require' ] );

			return <this.state.component { ...props } />;
		}

		return this.props.placeholder;
	}
}
