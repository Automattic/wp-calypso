/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import u2f from './u2f-api';
import Spinner from 'components/spinner';

class SecurityU2fKeyAdd extends React.Component {
	static propTypes = {
		onRegister: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		registerRequests: PropTypes.object.isRequired,
	};

	componentDidMount = () => {
		this.registerKey();
	};

	registerKey = () => {
		const appId = this.props.registerRequests.appId;
		delete this.props.registerRequests.appId;
		u2f.register( appId, [ this.props.registerRequests ], [], this.keyRegistered );
	};

	keySentToServer = () => {};

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
			<Card>
				{ !! u2f && (
					<Fragment>
						<div className="security-u2f-key__add-wait-for-key">
							<Spinner />
							<p>{ this.props.translate( 'Insert your USB key into your USB port.' ) }</p>
							<p>
								{ this.props.translate(
									'Then tap the button or gold disk on the security device'
								) }
							</p>
						</div>
						<div className="security-u2f-key__add-button-container">
							<Button onClick={ this.props.onCancel }>Cancel</Button>
						</div>
					</Fragment>
				) }
			</Card>
		);
	}
}

export default localize( SecurityU2fKeyAdd );
