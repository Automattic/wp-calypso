/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import { recordGoogleEvent } from 'state/analytics/actions';

class AddProfileLinksButtons extends React.Component {
	static propTypes = {
		showPopoverMenu: PropTypes.bool,
	};

	popoverContext = React.createRef();

	recordClickEvent = action => {
		this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	};

	handleAddWordPressSiteButtonClick = () => {
		this.recordClickEvent( 'Add a WordPress Site Button' );
		this.props.onShowAddWordPress();
	};

	handleOtherSiteButtonClick = () => {
		this.recordClickEvent( 'Add Other Site Button' );
		this.props.onShowAddOther();
	};

	render() {
		return (
			<div>
				<PopoverMenu
					isVisible={ this.props.showPopoverMenu }
					onClose={ this.props.onClosePopoverMenu }
					context={ this.popoverContext.current }
				>
					<PopoverMenuItem onClick={ this.handleAddWordPressSiteButtonClick }>
						{ this.props.translate( 'Add WordPress Site' ) }
					</PopoverMenuItem>
					<PopoverMenuItem onClick={ this.handleOtherSiteButtonClick }>
						{ this.props.translate( 'Add URL' ) }
					</PopoverMenuItem>
				</PopoverMenu>

				<Button compact ref={ this.popoverContext } onClick={ this.props.onShowPopoverMenu }>
					<Gridicon icon="add-outline" />
					<span>{ this.props.translate( 'Add' ) }</span>
				</Button>
			</div>
		);
	}
}

export default connect(
	null,
	{
		recordGoogleEvent,
	}
)( localize( AddProfileLinksButtons ) );
