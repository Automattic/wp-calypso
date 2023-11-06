import { Button, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createRef, Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

class AddProfileLinksButtons extends Component {
	static propTypes = {
		disabled: PropTypes.bool,
		showPopoverMenu: PropTypes.bool,
		onShowAddWordPress: PropTypes.func.isRequired,
		onShowAddOther: PropTypes.func.isRequired,
	};

	popoverContext = createRef();

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
		const { translate, disabled } = this.props;

		return (
			<Fragment>
				<Button
					ref={ this.popoverContext }
					compact
					disabled={ disabled }
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
