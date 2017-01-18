/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';

// Internal dependencies
import Button from 'components/button';
import observe from 'lib/mixins/data-observe';
import eventRecorder from 'me/event-recorder';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';

export default React.createClass( {

	displayName: 'AddProfileLinksButtons',

	mixins: [ observe( 'userProfileLinks' ), eventRecorder ],

	propTypes: {
		showingForm: React.PropTypes.bool,
		showPopoverMenu: React.PropTypes.bool
	},

	getDefaultProps() {
		return {
			showingForm: false
		};
	},

	getInitialState() {
		return {
			popoverPosition: 'top'
		};
	},

	render() {
		return(
			<div>

				<PopoverMenu
					isVisible={ this.props.showPopoverMenu }
					onClose={ this.props.onClosePopoverMenu }
					position={ this.state.popoverPosition }
					context={ this.refs && this.refs.popoverMenuButton }
					>
					<PopoverMenuItem
						onClick={ this.recordClickEvent( 'Add a WordPress Site Button', this.props.onShowAddWordPress ) }>
						{ this.translate( 'Add WordPress Site' ) }
					</PopoverMenuItem>
					<PopoverMenuItem
						onClick={ this.recordClickEvent( 'Add Other Site Button', this.props.onShowAddOther ) }>
						{ this.translate( 'Add URL' ) }
					</PopoverMenuItem>
				</PopoverMenu>

				<Button
					compact
					ref="popoverMenuButton"
					className="popover-icon"
					onClick={ this.props.onShowPopoverMenu }>
						<Gridicon icon="add-outline" />
						{ this.translate( 'Add' ) }
				</Button>
			</div>
		);
	}
} );
