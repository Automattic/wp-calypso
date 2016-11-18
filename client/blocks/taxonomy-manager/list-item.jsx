/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { isUndefined } from 'lodash';

/**
 * Internal dependencies
 */
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import Gridicon from 'components/gridicon';
import Count from 'components/count';

class TaxonomyManagerListItem extends Component {
	static propTypes = {
		name: PropTypes.string,
		postCount: PropTypes.number,
		translate: PropTypes.func,
		onClick: PropTypes.func,
		onDelete: PropTypes.func,
	};

	static defaultProps = {
		onClick: () => {},
	};

	constructor( props ) {
		super( props );
		this.state = {
			popoverMenuOpen: false
		};
	}

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

	deleteItem= () => {
		this.setState( {
			popoverMenuOpen: false
		} );
		this.props.onDelete();
	};

	render() {
		const { onDelete, postCount, name, translate } = this.props;

		return (
			<div>
				<span className="taxonomy-manager__label">
					{ name }
				</span>
				{ ! isUndefined( postCount ) &&
					<span className="taxonomy-manager__count">
						<Count count={ postCount } />
					</span>
				}
				<Gridicon
					icon="ellipsis"
					className={ classNames( {
						'taxonomy-manager__list-item-toggle': true,
						'is-active': this.state.popoverMenuOpen
					} ) }
					onClick={ this.togglePopoverMenu }
					ref="popoverMenuButton" />
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
					{ onDelete &&
						<PopoverMenuItem onClick={ this.deleteItem }>
							<Gridicon icon="trash" size={ 18 } />
							{ translate( 'Delete' ) }
						</PopoverMenuItem>
					}
					<PopoverMenuItem>
						<Gridicon icon="external" size={ 18 } />
						{ translate( 'View Posts' ) }
					</PopoverMenuItem>
				</PopoverMenu>
			</div>
		);
	}
}

export default localize( TaxonomyManagerListItem );
