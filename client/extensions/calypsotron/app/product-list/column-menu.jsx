import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import Button from 'components/button';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';

class ColumnMenu extends React.Component {
	propTypes: {
		context: PropTypes.object.isRequired,
		isVisible: PropTypes.bool.isRequired,
		columns: PropTypes.array.isRequired,
		columnGroups: PropTypes.array.isRequired,
		columnSelections: PropTypes.object.isRequired,
		onColumnSelect: PropTypes.func.isRequired,
	}

	render() {
		const __ = this.props.translate;
		const { context, isVisible, columns, columnGroups, columnSelections } = this.props;

		if ( isVisible ) {
			return (
					<PopoverMenu
						context={ context }
						isVisible={ isVisible }
						onClose={ () => { /* do nothing */ } }
						className="component__popover column-menu__popover"
						rootClassName="uses-s9n-styles"
						position="left"
					>
						<ul className='column-menu__list' >
							{ this.renderGroups( columns, columnGroups, columnSelections ) }
						</ul>
					</PopoverMenu>
			);
		} else {
			return null;
		}
	}

	renderGroups( columns, columnGroups, columnSelections ) {
		const groups = new Set( columns.map( ( col ) => col.group ) );

		return columnGroups.map( ( group ) => {
			return  (
				<li key={ group.name } className='column-menu__row' >
					<div className='column-menu__group-label column-menu__group-item'>{ group.name }</div>
					{ group.selections.map( ( selection ) => this.renderButton( selection, columnSelections ) ) }
				</li>
			);
		} );
	}

	renderButton( selection, columnSelections ) {
		const isSelected = columnSelections[ selection.key ];
		const className = 'column-menu__group-item column-menu__button ' + ( isSelected ? 'selected' : 'unselected' );
		const onClick = ( evt ) => {
			evt.preventDefault();
			this.props.onColumnSelect( selection, ! isSelected );
		};

		return <Button key={ selection.key } className={ className } onClick={ onClick } >{ selection.title }</Button>
	}
}

export default localize( ColumnMenu );
