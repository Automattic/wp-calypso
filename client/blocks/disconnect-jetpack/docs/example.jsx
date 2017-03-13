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
		this.toggleVisibilityFree = this.toggleVisibility.bind( this, 'free' );
		this.toggleVisibilityPersonal = this.toggleVisibility.bind( this, 'personal' );
		this.toggleVisibilityPremium = this.toggleVisibility.bind( this, 'premium' );
		this.toggleVisibilityProfessional = this.toggleVisibility.bind( this, 'professional' );
		this.toggleVisibilityBroken = this.toggleVisibility.bind( this, 'broken' );

		this.state = {
			isVisible : {
				free: false,
				personal: false,
				premium: false,
				professional: false,
				broken: false
			}
		};
	}

	toggleVisibility( type ) {
		this.state.isVisible[ type ] = !this.state.isVisible[ type ];
		this.setState( { 'isVisible': this.state.isVisible } );
	}

	render() {
		return (
			<Card>

				<p><Button onClick={ this.toggleVisibilityFree } >Disconnect Free Jetpack </Button></p>
				<DisconnectJetpack
					isVisible={ this.state.isVisible.free }
					siteId={ this.props.primarySiteId }
					onStay={ this.toggleVisibilityFree }
					onDisconnect={ this.toggleVisibilityFree }
					plan='free'
				/>

				<p><Button onClick={ this.toggleVisibilityPersonal } >Disconnect Personal Jetpack </Button></p>
				<DisconnectJetpack
					isVisible={ this.state.isVisible.personal }
					siteId={ this.props.primarySiteId }
					onStay={ this.toggleVisibilityPersonal }
					onDisconnect={ this.toggleVisibilityPersonal }
					plan='personal'
				/>

				<p><Button onClick={ this.toggleVisibilityPremium } >Disconnect Premium Jetpack </Button></p>
				<DisconnectJetpack
					isVisible={ this.state.isVisible.premium }
					siteId={ this.props.primarySiteId }
					onStay={ this.toggleVisibilityPremium }
					onDisconnect={ this.toggleVisibilityPremium }
					plan='premium'
				/>

				<p><Button onClick={ this.toggleVisibilityProfessional } >Disconnect Professional Jetpack </Button></p>
				<DisconnectJetpack
					isVisible={ this.state.isVisible.professional }
					siteId={ this.props.primarySiteId }
					onStay={ this.toggleVisibilityProfessional }
					onDisconnect={ this.toggleVisibilityProfessional }
					plan='professional'
				/>

				<p><Button onClick={ this.toggleVisibilityBroken } >Disconnect Probably Broken Jetpack </Button></p>
				<DisconnectJetpack
					isVisible={ this.state.isVisible.broken }
					siteId={ this.props.primarySiteId }
					onStay={ this.toggleVisibilityBroken }
					onDisconnect={ this.toggleVisibilityBroken }
					plan='personal'
					isBroken={ true }
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
