/** @format */

/**
 * External dependencies
 */
import Card from 'components/card';
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import u2f from './u2f-api';

class SecurityU2fKeyAdd extends React.Component {
	componentDidMount() {
		this.registerKey();
	}

	registerKey() {
		const registerRequests = [
			{ version: 'U2F_V2', challenge: this.createChallenge(), attestation: 'direct' },
		];
		u2f.register( 'https://wordpress.com', registerRequests, [], this.keyRegistered );
	}

	keyRegistered( data ) {
		console.log( JSON.stringify( data ) ); // eslint-disable-line
	}

	createChallenge() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
			const r = ( Math.random() * 16 ) | 0,
				v = c === 'x' ? r : ( r & 0x3 ) | 0x8;
			return v.toString( 16 );
		} );
	}

	render() {
		window.u2f = u2f;
		return <Fragment>{ !! u2f && <Card>Aaaaaaaaddddddd</Card> }</Fragment>;
	}
}

export default SecurityU2fKeyAdd;
