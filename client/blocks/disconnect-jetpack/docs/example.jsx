/**
 * External dependencies
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import DisconnectJetpackDialog from '../dialog';
import { Card, Button } from '@automattic/components';

class DisconnectJetpackDialogExample extends Component {
	constructor( props ) {
		super( props );
		this.toggleVisibilityFree = this.toggleVisibility.bind( this, 'free' );
		this.toggleVisibilityPersonal = this.toggleVisibility.bind( this, 'personal' );
		this.toggleVisibilityPremium = this.toggleVisibility.bind( this, 'premium' );
		this.toggleVisibilityProfessional = this.toggleVisibility.bind( this, 'professional' );
		this.toggleVisibilityBroken = this.toggleVisibility.bind( this, 'broken' );

		this.state = {
			isVisible: {
				free: false,
				personal: false,
				premium: false,
				professional: false,
				broken: false,
			},
		};
	}

	toggleVisibility( type ) {
		this.state.isVisible[ type ] = ! this.state.isVisible[ type ];
		this.setState( { isVisible: this.state.isVisible } );
	}

	render() {
		return (
			<Card>
				<p>
					<Button onClick={ this.toggleVisibilityFree }>Disconnect Free Jetpack </Button>
				</p>
				<DisconnectJetpackDialog
					isVisible={ this.state.isVisible.free }
					siteId={ this.props.primarySiteId }
					onClose={ this.toggleVisibilityFree }
				/>

				<p>
					<Button onClick={ this.toggleVisibilityPersonal }>Disconnect Personal Jetpack </Button>
				</p>
				<DisconnectJetpackDialog
					isVisible={ this.state.isVisible.personal }
					siteId={ this.props.primarySiteId }
					onClose={ this.toggleVisibilityPersonal }
				/>

				<p>
					<Button onClick={ this.toggleVisibilityPremium }>Disconnect Premium Jetpack </Button>
				</p>
				<DisconnectJetpackDialog
					isVisible={ this.state.isVisible.premium }
					siteId={ this.props.primarySiteId }
					onClose={ this.toggleVisibilityPremium }
				/>

				<p>
					<Button onClick={ this.toggleVisibilityProfessional }>
						Disconnect Professional Jetpack{ ' ' }
					</Button>
				</p>
				<DisconnectJetpackDialog
					isVisible={ this.state.isVisible.professional }
					siteId={ this.props.primarySiteId }
					onClose={ this.toggleVisibilityProfessional }
				/>

				<p>
					<Button onClick={ this.toggleVisibilityBroken }>
						Disconnect Probably Broken Jetpack{ ' ' }
					</Button>
				</p>
				<DisconnectJetpackDialog
					isVisible={ this.state.isVisible.broken }
					siteId={ this.props.primarySiteId }
					onClose={ this.toggleVisibilityBroken }
					isBroken={ true }
				/>
			</Card>
		);
	}
}

DisconnectJetpackDialogExample.displayName = 'DisconnectJetpackDialog';

export default DisconnectJetpackDialogExample;
