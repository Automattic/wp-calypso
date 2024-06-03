import { Button, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { canUserDeleteItem } from 'calypso/lib/media/utils';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';

const noop = () => {};

class MediaModalSecondaryActions extends Component {
	static propTypes = {
		user: PropTypes.object,
		site: PropTypes.object,
		selectedItems: PropTypes.array,
		onDelete: PropTypes.func,
		onViewDetails: PropTypes.func,
	};

	static defaultProps = {
		onDelete: noop,
	};

	getButtons() {
		const { selectedItems, site, translate, user, onDelete, onViewDetails } = this.props;

		const buttons = [];

		if ( selectedItems.length ) {
			buttons.push( {
				key: 'edit',
				text: translate( 'Edit' ),
				primary: true,
				onClick: onViewDetails,
			} );
		}

		const canDeleteItems =
			selectedItems.length &&
			selectedItems.every( ( item ) => canUserDeleteItem( item, user, site ) );
		if ( canDeleteItems ) {
			const isButtonDisabled = selectedItems.some( ( item ) => item.transient );
			buttons.push( {
				key: 'delete',
				icon: 'trash',
				className: 'editor-media-modal__delete',
				disabled: isButtonDisabled,
				onClick: isButtonDisabled ? noop : onDelete,
			} );
		}

		return buttons;
	}

	render() {
		if ( this.props.hideButton ) {
			return null;
		}

		return (
			<div>
				{ this.getButtons().map( ( button ) => (
					<Button
						key={ button.key }
						className={ clsx( 'editor-media-modal__secondary-action', button.className ) }
						data-e2e-button={ button.key }
						compact
						disabled={ button.disabled }
						onClick={ button.onClick }
					>
						{ button.icon && <Gridicon icon={ button.icon } /> }
						{ button.text }
					</Button>
				) ) }
			</div>
		);
	}
}

export default connect( ( state, { site } ) => ( {
	user: getCurrentUser( state ),
	hideButton: ! canCurrentUser( state, site.ID, 'publish_posts' ),
} ) )( localize( MediaModalSecondaryActions ) );
