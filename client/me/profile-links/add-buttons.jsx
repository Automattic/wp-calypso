/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import { recordGoogleEvent } from 'state/analytics/actions';

class AddProfileLinksButtons extends React.Component {
	static propTypes = {
		showingForm: PropTypes.string,
		showPopoverMenu: PropTypes.bool,
		onShowAddWordPress: PropTypes.func.isRequired,
		onShowAddOther: PropTypes.func.isRequired,
	};

	popoverContext = React.createRef();

	recordClickEvent = ( action ) => {
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
		const { translate } = this.props;

		return (
			<Fragment>
				<Button
					ref={ this.popoverContext }
					compact
					disabled={ !! this.props.showingForm }
					onClick={ this.props.onShowPopoverMenu }
				>
					<Gridicon icon="add-outline" />
					<span>{ translate( 'Add' ) }</span>
				</Button>
				{ this.props.showPopoverMenu && (
					<PopoverMenu
						isVisible
						onClose={ this.props.onClosePopoverMenu }
						context={ this.popoverContext.current }
					>
						<PopoverMenuItem onClick={ this.handleAddWordPressSiteButtonClick }>
							{ translate( 'Add WordPress Site' ) }
						</PopoverMenuItem>
						<PopoverMenuItem onClick={ this.handleOtherSiteButtonClick }>
							{ translate( 'Add URL' ) }
						</PopoverMenuItem>
					</PopoverMenu>
				) }
			</Fragment>
		);
	}
}

export default connect( null, {
	recordGoogleEvent,
} )( localize( AddProfileLinksButtons ) );
