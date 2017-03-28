/**
 * External dependencies
 */
import React, { Component } from 'react';
import page from 'page';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getAccountRecoveryCurrentRoute } from 'state/selectors';

const transit = ( ComposedComponent ) => {
	const ResultComponent = class extends Component {
		componentWillReceiveProps( nextProps ) {
			if ( this.props.accountRecoveryCurrentRoute !== nextProps.accountRecoveryCurrentRoute ) {
				page( nextProps.accountRecoveryCurrentRoute );
			}
		}

		render() {
			return <ComposedComponent { ...this.props } />;
		}
	};

	return connect( ( state ) => ( {
		accountRecoveryCurrentRoute: getAccountRecoveryCurrentRoute( state ),
	} ) )( ResultComponent );
};

export default transit;
