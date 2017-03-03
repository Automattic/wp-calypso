/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { values, noop, some, every, flow, partial, pick } from 'lodash';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { canUserDeleteItem } from 'lib/media/utils';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getMediaModalView } from 'state/ui/media-modal/selectors';
import { setEditorMediaModalView } from 'state/ui/editor/actions';
import { ModalViews } from 'state/ui/media-modal/constants';
import { withAnalytics, bumpStat, recordGoogleEvent } from 'state/analytics/actions';
import Button from 'components/button';

class MediaModalSecondaryActions extends Component {
	static propTypes = {
		user: PropTypes.object,
		site: PropTypes.object,
		selectedItems: PropTypes.array,
		view: React.PropTypes.oneOf( values( ModalViews ) ),
		disabled: PropTypes.bool,
		onDelete: PropTypes.func,
		onViewDetails: PropTypes.func,
		renderStorage: PropTypes.bool,
	};

	static defaultProps = {
		disabled: false,
		onDelete: noop,
		renderStorage: true,
	};

	getButtons() {
		const {
			disabled,
			selectedItems,
			site,
			translate,
			user,
			view,

			onDelete,
			onViewDetails,
		} = this.props;

		const buttons = [];

		if ( ModalViews.LIST === view && selectedItems.length ) {
			buttons.push( {
				key: 'edit',
				text: translate( 'Edit' ),
				disabled: disabled,
				primary: true,
				onClick: onViewDetails
			} );
		}

		const canDeleteItems = selectedItems.length && every( selectedItems, ( item ) => {
			return canUserDeleteItem( item, user, site );
		} );

		if ( ModalViews.GALLERY !== view && canDeleteItems ) {
			buttons.push( {
				key: 'delete',
				icon: 'trash',
				className: 'editor-media-modal__delete',
				disabled: disabled || some( selectedItems, 'transient' ),
				onClick: onDelete
			} );
		}

		return buttons;
	}

	render() {
		return (
			<div>
				{ this.getButtons().map( button => <Button
					className={ classNames( 'editor-media-modal__secondary-action', button.className ) }
					icon={ !! button.icon }
					compact
					{ ...pick( button, [ 'key', 'disabled', 'onClick', 'primary' ] ) }
				>
					{ button.icon && <Gridicon icon={ button.icon } /> }
					{ button.text && button.text }
				</Button> ) }
			</div>
		);
	}
}

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
	}, function mergeProps( stateProps, dispatchProps, ownProps ) {
		//We want to overwrite connected props if 'onViewDetails', 'view' were provided
		return Object.assign( {}, ownProps, stateProps, dispatchProps, pick( ownProps, [ 'onViewDetails', 'view' ] ) );
	}
)( localize( MediaModalSecondaryActions ) );
