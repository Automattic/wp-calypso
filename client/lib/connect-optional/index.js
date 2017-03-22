/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { constant, noop } from 'lodash';

const fakeStore = {
	dispatch: noop,
	getState: constant( {} ),
	subscribe: noop,
};

const connectOptional = ( ...connectArgs ) => WrappedComponent =>
	wrapWithOptionalConnect( connect( ...connectArgs )( WrappedComponent ) );

function wrapWithOptionalConnect( WrappedComponent ) {
	return class extends Component {
		static contextTypes = {
			store: PropTypes.object
		};

		constructor( props, context ) {
			super( props, context );
			this.store = props.store ||
				context.store ||
				fakeStore;
		}

		render() {
			return <WrappedComponent { ...this.props } store={ this.store } />;
		}
	};
}

export default connectOptional;
