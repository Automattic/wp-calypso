/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { omit } from 'lodash';

export default class AsyncLoad extends Component {
	static propTypes = {
		require: PropTypes.func.isRequired,
		placeholder: PropTypes.node
	};

	constructor() {
		super( ...arguments );

		this.state = {
			dirty: false,
			component: null
		};
	}

	componentWillMount() {
		this.require();
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.require !== nextProps.require ) {
			this.setState( { dirty: true } );
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
		this.props.require( ( component ) => {
			this.setState( { component, dirty: false } );
		} );
	}

	render() {
		if ( this.state.component && ! this.state.dirty ) {
			const props = omit( this.props, [ 'require', 'placeholder' ] );
			return <this.state.component { ...props } />;
		}

		if ( this.props.placeholder ) {
			return this.props.placeholder;
		}

		return <div className="async-load" />;
	}
}
