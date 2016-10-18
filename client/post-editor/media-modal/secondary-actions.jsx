/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { values, noop, some, every, flow, partial } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import TrackComponentView from 'lib/analytics/track-component-view';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import Gridicon from 'components/gridicon';
import { canUserDeleteItem } from 'lib/media/utils';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import PlanStorage from 'my-sites/plan-storage';
import { getMediaModalView } from 'state/ui/media-modal/selectors';
import { setEditorMediaModalView } from 'state/ui/editor/actions';
import { ModalViews } from 'state/ui/media-modal/constants';
import { withAnalytics, bumpStat, recordGoogleEvent } from 'state/analytics/actions';

const MediaModalSecondaryActions = React.createClass( {
	propTypes: {
		user: PropTypes.object,
		site: PropTypes.object,
		selectedItems: PropTypes.array,
		view: React.PropTypes.oneOf( values( ModalViews ) ),
		disabled: PropTypes.bool,
		onDelete: PropTypes.func,
		onViewDetails: PropTypes.func
	},

	getDefaultProps() {
		return {
			disabled: false,
			onDelete: noop
		};
	},

	getInitialState() {
		return {
			isMobilePopoverVisible: false
		};
	},

	setMobilePopoverContext( component ) {
		if ( ! component ) {
			return;
		}

		this.setState( {
			mobilePopoverContext: component
		} );
	},

	navigateToPlans() {
		analytics.ga.recordEvent( 'Media', 'Clicked Plan Storage Button' );
		analytics.tracks.recordEvent( 'calypso_upgrade_nudge_cta_click', {
			cta_name: 'plan-media-storage'
		} );
		page( `/plans/${ this.props.siteSlug }` );
	},

	getButtons() {
		const {
			user,
			site,
			selectedItems,
			view,
			disabled,
			onDelete
		} = this.props;

		let buttons = [];

		if ( ModalViews.LIST === view && selectedItems.length ) {
			buttons.push( {
				key: 'edit',
				value: this.translate( 'Edit' ),
				disabled: disabled,
				onClick: this.props.onViewDetails
			} );
		}

		const canDeleteItems = selectedItems.length && every( selectedItems, ( item ) => {
			return canUserDeleteItem( item, user, site );
		} );

		if ( ModalViews.GALLERY !== view && canDeleteItems ) {
			buttons.push( {
				key: 'delete',
				value: this.translate( 'Delete' ),
				className: 'is-link editor-media-modal__delete',
				disabled: disabled || some( selectedItems, 'transient' ),
				onClick: onDelete
			} );
		}

		return buttons;
	},

	toggleMobilePopover() {
		this.setState( {
			isMobilePopoverVisible: ! this.state.isMobilePopoverVisible
		} );
	},

	renderMobileButtons() {
		const buttons = this.getButtons();

		if ( ! buttons.length ) {
			return;
		}

		const classes = classNames( 'editor-media-modal__secondary-action', 'button', 'is-mobile', 'is-link', {
			'is-active': this.state.isMobilePopoverVisible
		} );

		const menuItems = buttons.map( ( button ) => {
			const onClick = () => {
				this.toggleMobilePopover();

				if ( button.onClick ) {
					button.onClick();
				}
			};

			return React.createElement( PopoverMenuItem, {
				key: button.key,
				action: button.key,
				onClick: onClick
			}, button.value );
		} );

		return (
			<button
				ref={ this.setMobilePopoverContext }
				onClick={ this.toggleMobilePopover }
				className={ classes }>
				<span className="screen-reader-text">{ this.translate( 'More Options' ) }</span>
				<Gridicon icon="ellipsis" size={ 24 } />
				<PopoverMenu
					context={ this.state.mobilePopoverContext }
					isVisible={ this.state.isMobilePopoverVisible }
					onClose={ this.toggleMobilePopover }
					position="top right"
					className="popover is-dialog-visible">
					{ menuItems }
				</PopoverMenu>
			</button>
		);
	},

	renderDesktopButtons() {
		return this.getButtons().map( ( button ) => {
			return React.createElement( 'input', Object.assign( {
				type: 'button'
			}, button, {
				className: classNames( 'editor-media-modal__secondary-action', 'button', 'is-desktop', button.className )
			} ) );
		} );
	},

	renderPlanStorage() {
		if ( this.props.selectedItems.length === 0 ) {
			const eventName = 'calypso_upgrade_nudge_impression';
			const eventProperties = { cta_name: 'plan-media-storage' };
			return (
				<PlanStorage
					className="editor-media-modal__plan-storage"
					onClick={ this.navigateToPlans }
					siteId={ this.props.site.ID } >
					<TrackComponentView eventName={ eventName } eventProperties={ eventProperties } />
				</PlanStorage>
			);
		}
		return null;
	},

	render() {
		return (
			<div className="editor-media-modal__secondary-actions">
				{ this.renderMobileButtons() }
				{ this.renderDesktopButtons() }
				{ this.renderPlanStorage() }
			</div>
		);
	}
} );

export default connect(
	( state, ownProps ) => ( {
		view: getMediaModalView( state ),
		user: getCurrentUser( state ),
		siteSlug: ownProps.site ? getSiteSlug( state, ownProps.site.ID ) : ''
	} ),
	{
		onViewDetails: flow(
			withAnalytics( bumpStat( 'editor_media_actions', 'edit_button_dialog' ) ),
			withAnalytics( recordGoogleEvent( 'Media', 'Clicked Dialog Edit Button' ) ),
			partial( setEditorMediaModalView, ModalViews.DETAIL )
		)
	}
)( MediaModalSecondaryActions );
