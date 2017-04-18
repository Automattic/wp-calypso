/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import { recordTracksEvent } from 'state/analytics/actions';
import config from 'config';
import sitesFactory from 'lib/sites-list';
import { abtest } from 'lib/abtest';

const sites = sitesFactory();

class SiteSelectorAddSite extends Component {
	constructor() {
		super();

		this.state = {
			showPopoverMenu: false,
			popoverPosition: 'top'
		};

		this.handleShowPopover = this.handleShowPopover.bind( this );
		this.onPopoverButtonClick = this.onPopoverButtonClick.bind( this );
		this.onClosePopover = this.onClosePopover.bind( this );
		this.recordAddNewSite = this.recordAddNewSite.bind( this );
		this.recordPopoverAddNewSite = this.recordPopoverAddNewSite.bind( this );
		this.recordPopoverAddJetpackSite = this.recordPopoverAddJetpackSite.bind( this );
	}

	getAddNewSiteUrl() {
		if ( sites.getJetpack().length ||
			abtest( 'newSiteWithJetpack' ) === 'showNewJetpackSite' ) {
			return '/jetpack/new/?ref=calypso-selector';
		}
		return config( 'signup_url' ) + '?ref=calypso-selector';
	}

	handleShowPopover( isShowing ) {
		const action = isShowing ? 'show' : 'hide';

		this.setState( {
			showPopoverMenu: isShowing
		} );

		this.props.recordTracksEvent( 'calypso_add_site_popover', { action } );
	}

	onPopoverButtonClick() {
		this.handleShowPopover( ! this.state.showPopoverMenu );
	}

	onClosePopover() {
		this.handleShowPopover( false );
	}

	recordAddNewSite() {
		this.props.recordTracksEvent( 'calypso_add_new_wordpress_click' );
	}

	recordPopoverAddNewSite() {
		this.props.recordTracksEvent( 'calypso_add_new_wordpress_popover_click' );
	}

	recordPopoverAddJetpackSite() {
		this.props.recordTracksEvent( 'calypso_add_jetpack_site_popover_click' );
	}

	renderButton() {
		const { translate } = this.props;
		return (
			<span className="site-selector__add-new-site">
				<Button borderless href={ this.getAddNewSiteUrl() } onClick={ this.recordAddNewSite }>
					<Gridicon icon="add-outline" /> { translate( 'Add New Site' ) }
				</Button>
			</span>
		);
	}

	renderButtonWithPopover() {
		const { translate } = this.props;
		return (
			<span className="site-selector__add-new-site" ref="popoverMenuTarget">
				<PopoverMenu
					isVisible={ this.state.showPopoverMenu }
					onClose={ this.onClosePopover }
					position={ this.state.popoverPosition }
					context={ this.refs && this.refs.popoverMenuTarget }
					>
					<PopoverMenuItem href={ this.getAddNewSiteUrl() } onClick={ this.recordPopoverAddNewSite }>
						{ translate( 'New WordPress.com site' ) }
					</PopoverMenuItem>
					<PopoverMenuItem href="/jetpack/connect" onClick={ this.recordPopoverAddJetpackSite }>
						{ translate( 'Self-hosted WordPress site' ) }
					</PopoverMenuItem>
				</PopoverMenu>

				<Button borderless onClick={ this.onPopoverButtonClick }>
					<Gridicon icon="add-outline" /> { translate( 'Add Site' ) }
				</Button>
			</span>
		);
	}

	render() {
		return this.renderButton();
	}
}

export default connect(
	null,
	dispatch => bindActionCreators( {
		recordTracksEvent
	}, dispatch )
)( localize( SiteSelectorAddSite ) );
