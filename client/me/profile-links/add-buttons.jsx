/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import createReactClass from 'create-react-class';
import Gridicon from 'gridicons';

// Internal dependencies
import Button from 'components/button';
import observe from 'lib/mixins/data-observe';
import eventRecorder from 'me/event-recorder';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';

const AddProfileLinksButtons = createReactClass( {
	displayName: 'AddProfileLinksButtons',

	mixins: [ observe( 'userProfileLinks' ), eventRecorder ],

	propTypes: {
		showingForm: PropTypes.bool,
		showPopoverMenu: PropTypes.bool,
	},

	getDefaultProps() {
		return {
			showingForm: false,
		};
	},

	getInitialState() {
		return {
			popoverPosition: 'top',
		};
	},

	render() {
		return (
			<div>
				<PopoverMenu
					isVisible={ this.props.showPopoverMenu }
					onClose={ this.props.onClosePopoverMenu }
					position={ this.state.popoverPosition }
					context={ this.refs && this.refs.popoverMenuButton }
				>
					<PopoverMenuItem
						onClick={ this.recordClickEvent(
							'Add a WordPress Site Button',
							this.props.onShowAddWordPress
						) }
					>
						{ this.props.translate( 'Add WordPress Site' ) }
					</PopoverMenuItem>
					<PopoverMenuItem
						onClick={ this.recordClickEvent( 'Add Other Site Button', this.props.onShowAddOther ) }
					>
						{ this.props.translate( 'Add URL' ) }
					</PopoverMenuItem>
				</PopoverMenu>

				<Button
					compact
					ref="popoverMenuButton"
					className="popover-icon"
					onClick={ this.props.onShowPopoverMenu }
				>
					<Gridicon icon="add-outline" />
					{ this.props.translate( 'Add' ) }
				</Button>
			</div>
		);
	},
} );

export default localize( AddProfileLinksButtons );
