/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, isUndefined } from 'lodash';

/**
 * Internal dependencies
 */
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import PopoverMenuSeparator from 'components/popover/menu-separator';
import Gridicon from 'components/gridicon';
import Count from 'components/count';
import Dialog from 'components/dialog';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSettings } from 'state/site-settings/selectors';
import { deleteTerm } from 'state/terms/actions';
import { saveSiteSettings } from 'state/site-settings/actions';
import { decodeEntities } from 'lib/formatting';

class TaxonomyManagerListItem extends Component {
	static propTypes = {
		canSetAsDefault: PropTypes.bool,
		deleteTerm: PropTypes.func,
		isDefault: PropTypes.bool,
		onClick: PropTypes.func,
		saveSiteSettings: PropTypes.func,
		siteId: PropTypes.number,
		term: PropTypes.object,
		translate: PropTypes.func,
	};

	static defaultProps = {
		onClick: () => {},
	};

	state = {
		popoverMenuOpen: false,
		showDeleteDialog: false,
	};

	togglePopoverMenu = event => {
		event.stopPropagation && event.stopPropagation();
		this.setState( {
			popoverMenuOpen: ! this.state.popoverMenuOpen
		} );
	};

	editItem = () => {
		this.setState( {
			popoverMenuOpen: false
		} );
		this.props.onClick();
	};

	deleteItem = () => {
		this.setState( {
			popoverMenuOpen: false,
			showDeleteDialog: true
		} );
	};

	closeDeleteDialog = action => {
		if ( action === 'delete' ) {
			const { siteId, taxonomy, term } = this.props;
			this.props.deleteTerm( siteId, taxonomy, term.ID, term.slug );
		}
		this.setState( {
			showDeleteDialog: false
		} );
	};

	setAsDefault = () => {
		const { canSetAsDefault, siteId, term } = this.props;
		if ( canSetAsDefault ) {
			this.props.saveSiteSettings( siteId, { default_category: term.ID } );
		}
		this.setState( {
			popoverMenuOpen: false
		} );
	};

	render() {
		const { canSetAsDefault, isDefault, term, translate } = this.props;
		const name = decodeEntities( term.name ) || translate( 'Untitled' );
		const className = classNames( 'taxonomy-manager__item', {
			'is-default': isDefault
		} );
		const deleteDialogButtons = [
			{ action: 'cancel', label: translate( 'Cancel' ) },
			{ action: 'delete', label: translate( 'OK' ), isPrimary: true },
		];

		return (
			<div className={ className }>
				<span className="taxonomy-manager__icon">
					<Gridicon icon={ isDefault ? 'checkmark-circle' : 'folder' } />
				</span>
				<span className="taxonomy-manager__label">
					<span>{ name }</span>
					{ isDefault &&
						<span className="taxonomy-manager__default-label">
							{ translate( 'default', { context: 'label for terms marked as default' } ) }
						</span>
					}
				</span>
				{ ! isUndefined( term.post_count ) && <Count count={ term.post_count } /> }
				<span
					className="taxonomy-manager__action-wrapper"
					onClick={ this.togglePopoverMenu }
					ref="popoverMenuButton">
					<Gridicon
						icon="ellipsis"
						className={ classNames( {
							'taxonomy-manager__list-item-toggle': true,
							'is-active': this.state.popoverMenuOpen
						} ) } />
				</span>
				<PopoverMenu
					isVisible={ this.state.popoverMenuOpen }
					onClose={ this.togglePopoverMenu }
					position={ 'bottom left' }
					context={ this.refs && this.refs.popoverMenuButton }
				>
					<PopoverMenuItem onClick={ this.editItem }>
						<Gridicon icon="pencil" size={ 18 } />
						{ translate( 'Edit' ) }
					</PopoverMenuItem>
					<PopoverMenuItem onClick={ this.deleteItem }>
						<Gridicon icon="trash" size={ 18 } />
						{ translate( 'Delete' ) }
					</PopoverMenuItem>
					<PopoverMenuItem>
						<Gridicon icon="external" size={ 18 } />
						{ translate( 'View Posts' ) }
					</PopoverMenuItem>
					{ canSetAsDefault && ! isDefault && <PopoverMenuSeparator /> }
					{ canSetAsDefault && ! isDefault &&
						<PopoverMenuItem onClick={ this.setAsDefault }>
							<Gridicon icon="checkmark-circle" size={ 18 } />
							{ translate( 'Set as default' ) }
						</PopoverMenuItem>
					}
				</PopoverMenu>

				<Dialog
					isVisible={ this.state.showDeleteDialog }
					buttons={ deleteDialogButtons }
					onClose={ this.closeDeleteDialog }
				>
					<p>{ translate( 'Are you sure you want to permanently delete this item?' ) }</p>
				</Dialog>
			</div>
		);
	}
}

export default connect(
	( state, { taxonomy, term } ) => {
		const siteId = getSelectedSiteId( state );
		const siteSettings = getSiteSettings( state, siteId );
		const canSetAsDefault = taxonomy === 'category';
		const isDefault = canSetAsDefault && get( siteSettings, [ 'default_category' ] ) === term.ID;

		return {
			isDefault,
			canSetAsDefault,
			siteId,
		};
	},
	{ deleteTerm, saveSiteSettings }
)( localize( TaxonomyManagerListItem ) );
