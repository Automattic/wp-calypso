/** @format */

/**
 * External dependencies
 */
import Card from 'components/card';
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import u2f from './u2f-api';

class SecurityU2fKeyAdd extends React.Component {
	static propTypes = {
		onRegister: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
	};

	registerKey = () => {
		const registerRequests = [
			{ version: 'U2F_V2', challenge: this.createChallenge(), attestation: 'direct' },
		];
		u2f.register(
			window.location.protocol + '//' + window.location.host,
			registerRequests,
			[],
			this.keyRegistered
		);
	};

	keyRegistered = data => {
		this.props.onRegister( data );
	};

	createChallenge() {
		return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
			const r = ( Math.random() * 16 ) | 0,
				v = c === 'x' ? r : ( r & 0x3 ) | 0x8;
			return v.toString( 16 );
		} );
	}

	render() {
		window.u2f = u2f;
		return (
			<Fragment>
				{ !! u2f && (
					<Card>
						<Button compact onClick={ this.registerKey }>
							Register Key
						</Button>
						<Button compact onClick={ this.props.onCancel }>
							Cancel
						</Button>
					</Card>
				) }
			</Fragment>
		);
	}
}

export default SecurityU2fKeyAdd;
