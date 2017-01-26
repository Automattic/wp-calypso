/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import Popover from 'components/popover';

class AdminBar extends Component {

	state = {
		isWpMenuVisible: false
	};

	toggleWpMenu = ( isWpMenuVisible ) => this.setState( { isWpMenuVisible } );

	hideWpMenu = () => this.toggleWpMenu( false );
	showWpMenu = () => this.toggleWpMenu( true );

	setPopoverContext = ( popoverContext ) => {
		if ( popoverContext ) {
			this.setState( { popoverContext } );
		}
	};

	render() {
		const { isWpMenuVisible, popoverContext } = this.state;

		return (
			<Card compact className="adminbar">
				<Button borderless>
					<Gridicon icon="ellipsis" />
				</Button>
				<Button
					borderless
					ref={ this.setPopoverContext }
					onClick={ isWpMenuVisible ? this.hideWpMenu : this.showWpMenu }>
					<Gridicon icon="my-sites" />
				</Button>
				<Popover
					className="adminbar__main-menu"
					onClose={ this.hideWpMenu }
					isVisible={ isWpMenuVisible }
					context={ popoverContext }
					position="top left"
				>
					<Button borderless>
						<Gridicon icon="my-sites" /> My Sites
					</Button>
					<Button borderless>
						<Gridicon icon="reader" /> Reader
					</Button>
					<Button borderless>
						<Gridicon icon="user-circle" /> Me
					</Button>
					<Button borderless>
						<Gridicon icon="bell" /> Notifications
					</Button>
				</Popover>
			</Card>
		);
	}
}

export default AdminBar;
