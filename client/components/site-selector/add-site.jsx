/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import { recordTracksEvent } from 'state/analytics/actions';
import config from 'config';

const SiteSelectorAddSite = React.createClass( {
	getInitialState() {
		return {
			showPopoverMenu: false,
			popoverPosition: 'top'
		};
	},

	getAddNewSiteUrl() {
		return config( 'signup_url' ) + '?ref=calypso-selector';
	},

	handleShowPopover( isShowing ) {
		const action = isShowing ? 'show' : 'hide';

		this.setState( {
			showPopoverMenu: isShowing
		} );

		this.props.recordTracksEvent( 'calypso_add_site_popover', { action } );
	},

	onPopoverButtonClick() {
		this.handleShowPopover( ! this.state.showPopoverMenu );
	},

	onClosePopover() {
		this.handleShowPopover( false );
	},

	recordAddNewSite() {
		this.props.recordTracksEvent( 'calypso_add_new_wordpress_click' );
	},

	recordPopoverAddNewSite() {
		this.props.recordTracksEvent( 'calypso_add_new_wordpress_popover_click' );
	},

	recordPopoverAddJetpackSite() {
		this.props.recordTracksEvent( 'calypso_add_jetpack_site_popover_click' );
	},

	renderButton() {
		return (
			<span className="site-selector__add-new-site">
				<Button compact borderless href={ this.getAddNewSiteUrl() } onClick={ this.recordAddNewSite }>
					<Gridicon icon="add-outline" /> { this.translate( 'Add New Site' ) }
				</Button>
			</span>
		);
	},

	renderButtonWithPopover() {
		return (
			<span className="site-selector__add-new-site">
				<PopoverMenu
					isVisible={ this.state.showPopoverMenu }
					onClose={ this.onClosePopover }
					position={ this.state.popoverPosition }
					context={ this.refs && this.refs.popoverMenuButton }
					>
					<PopoverMenuItem href={ this.getAddNewSiteUrl() } onClick={ this.recordPopoverAddNewSite }>
						{ this.translate( 'Start a new WordPress.com site' ) }
					</PopoverMenuItem>
					<PopoverMenuItem href="/jetpack/connect" onClick={ this.recordPopoverAddJetpackSite }>
						{ this.translate( 'Add a self-hosted WordPress site' ) }
					</PopoverMenuItem>
				</PopoverMenu>

				<Button compact borderless onClick={ this.onPopoverButtonClick } ref="popoverMenuButton">
					<Gridicon icon="add-outline" /> { this.translate( 'Add WordPress Site' ) }
				</Button>
			</span>
		);
	},

	render() {
		return this.renderButtonWithPopover();
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( {
		recordTracksEvent
	}, dispatch )
)( SiteSelectorAddSite );
