/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import DisconnectJetpack from '../';
import Card from 'components/card';
import Button from 'components/button';
import { getCurrentUser } from 'state/current-user/selectors';

class DisconnectJetpackExample extends Component {
	constructor( props ) {
		super( props );
		this.toggleVisibility = this.toggleVisibility.bind( this );
		this.state = {
			isVisible: false,
		};
	}

	toggleVisibility() {
		this.setState( { 'isVisible': ! this.state.isVisible } );
	}

	render() {
		return (
			<Card>
				<Button onClick={ this.toggleVisibility } >Disconnect Jetpack </Button>
				<DisconnectJetpack
					isVisible={ this.state.isVisible }
					siteId={ this.props.primarySiteId }
					onStay={ this.toggleVisibility }
					onDisconnect={ this.toggleVisibility }
				/>
			</Card>
		);
	}
}

const DisconnectJetpackSelectorExample = connect( ( state ) => {
	const user = getCurrentUser( state );
	if ( ! user ) {
		return {};
	}

	return {
		primarySiteId: user.primary_blog
	};
} )( DisconnectJetpackExample );

DisconnectJetpackSelectorExample.displayName = 'DisconnectJetpackExample';

export default DisconnectJetpackSelectorExample;
