/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import omit from 'lodash/omit';

export default class AsyncLoad extends Component {
	constructor() {
		super( ...arguments );

		this.state = {
			component: null
		};
	}

	componentWillMount() {
		this.props.require( ( component ) => {
			this.setState( { component } );
		} );
	}

	render() {
		if ( this.state.component ) {
			const props = omit( this.props, Object.keys( this.constructor.propTypes ) );
			return <this.state.component { ...props } />;
		}

		if ( this.props.placeholder ) {
			return this.props.placeholder;
		}

		return null;
	}
}

AsyncLoad.propTypes = {
	require: PropTypes.func.isRequired,
	placeholder: PropTypes.node
};
