/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import Gridicon from 'components/gridicon';

class TaxonomyManagerListItem extends Component {
	static propTypes = {
		name: PropTypes.string,
		translate: PropTypes.func,
		onClick: PropTypes.func,
	};

	static defaultProps = {
		onClick: () => {}
	};

	constructor( props ) {
		super( props );
		this.state = {
			popoverMenuOpen: false
		};
	}

	togglePopoverMenu = () => {
		this.setState( {
			popoverMenuOpen: ! this.state.popoverMenuOpen
		} )
	}

	render() {
		const { name, translate } = this.props;

		return (
			<div>
				<span className="taxonomy-manager__label">{ name }</span>
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
					<PopoverMenuItem onClick={ this.props.onClick }>
						<Gridicon icon="pencil" size={ 18 } />
						{ translate( 'Edit' ) }
					</PopoverMenuItem>
					<PopoverMenuItem>
						<Gridicon icon="trash" size={ 18 } />
						{ translate( 'Delete' ) }
					</PopoverMenuItem>
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
