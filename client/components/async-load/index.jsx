/**
 * External dependencies
 */
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class AsyncLoad extends Component {
	static propTypes = {
		require: PropTypes.func.isRequired,
		placeholder: PropTypes.node
	};

	constructor() {
		super( ...arguments );

		this.state = {
			require: null,
			component: null
		};
	}

	componentWillMount() {
		this.require();
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.require !== nextProps.require ) {
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

	require() {
		const requireFunction = this.props.require;
		requireFunction( ( component ) => {
			if ( this.props.require === requireFunction ) {
				this.setState( { component } );
			}
		} );
	}

	render() {
		if ( this.state.component ) {
			const props = omit( this.props, [ 'require', 'placeholder' ] );
			return <this.state.component { ...props } />;
		}

		if ( this.props.placeholder ) {
			return this.props.placeholder;
		}

		return <div className="async-load" />;
	}
}
