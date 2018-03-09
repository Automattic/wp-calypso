/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import config from 'config';
import Button from 'components/button';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import { recordTracksEvent } from 'state/analytics/actions';

class SiteSelectorAddSite extends Component {
	state = {
		showPopoverMenu: false,
	};

	handleShowPopover = isShowing => {
		const action = isShowing ? 'show' : 'hide';

		this.setState( {
			showPopoverMenu: isShowing,
		} );

		this.props.recordTracksEvent( 'calypso_add_site_popover', { action } );
	};

	onPopoverButtonClick = () => {
		this.handleShowPopover( ! this.state.showPopoverMenu );
	};

	onClosePopover = () => {
		this.handleShowPopover( false );
	};

	getNewWpcomSiteUrl() {
		return config( 'signup_url' ) + '?ref=calypso-selector';
	}

	getNewJetpackSiteUrl() {
		return '/jetpack/connect/?ref=calypso-selector';
	}

	recordPopoverAddNewSite = () => {
		this.props.recordTracksEvent( 'calypso_add_new_wordpress_popover_click' );
	};

	recordPopoverAddJetpackSite = () => {
		this.props.recordTracksEvent( 'calypso_add_jetpack_site_popover_click' );
	};

	popoverToggleRef = node => {
		this.popoverToggle = node;
	};

	render() {
		const { translate } = this.props;
		return (
			<span className="site-selector__add-new-site">
				<PopoverMenu
					className="site-selector__popover"
					isVisible={ this.state.showPopoverMenu }
					onClose={ this.onClosePopover }
					context={ this.popoverToggle }
				>
					<PopoverMenuItem
						href={ this.getNewWpcomSiteUrl() }
						onClick={ this.recordPopoverAddNewSite }
					>
						<span>
							<span>{ translate( 'Create a new site' ) }</span>
							<span className="site-selector__popover-item-details">
								{ translate( 'Start a new WordPress.com site' ) }
							</span>
						</span>
					</PopoverMenuItem>
					<PopoverMenuItem
						href={ this.getNewJetpackSiteUrl() }
						onClick={ this.recordPopoverAddJetpackSite }
					>
						<span>
							<span>{ translate( 'Add an existing site' ) }</span>
							<span className="site-selector__popover-item-details">
								{ translate( 'Add a self-hosted WordPress site' ) }
							</span>
						</span>
					</PopoverMenuItem>
				</PopoverMenu>

				<Button borderless onClick={ this.onPopoverButtonClick } ref={ this.popoverToggleRef }>
					<Gridicon icon="add-outline" /> { translate( 'Add New Site' ) }
				</Button>
			</span>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( SiteSelectorAddSite ) );
