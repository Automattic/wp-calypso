/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import Button from 'components/button';
import PopoverMenu from 'components/popover/menu';

/**
 * Internal dependencies
 */

class ColumnMenu extends React.Component {
	static propTypes = {
		context: PropTypes.object,
		isVisible: PropTypes.bool.isRequired,
		columns: PropTypes.array.isRequired,
		columnGroups: PropTypes.array.isRequired,
		columnSelections: PropTypes.object.isRequired,
		onColumnSelect: PropTypes.func.isRequired,
	}

	onClose() {
		// do nothing.
	}

	render() {
		const { context, isVisible, columns, columnGroups, columnSelections } = this.props;

		const menuClasses = classNames(
			'component__popover',
			'product-list__column-menu-popover'
		);

		if ( isVisible ) {
			return (
					<PopoverMenu
						context={ context }
						isVisible={ isVisible }
						onClose={ this.onClose }
						className={ menuClasses }
						rootClassName="uses-s9n-styles"
						position="left"
					>
						<ul className={ 'product-list__column-menu-list' } >
							{ this.renderGroups( columns, columnGroups, columnSelections ) }
						</ul>
					</PopoverMenu>
			);
		}

		return null;
	}

	renderGroups( columns, columnGroups, columnSelections ) {
		const divClasses = classNames(
			'product-list__column-menu-group-label',
			'product-list__column-menu-group-item'
		);

		return columnGroups.map( ( group ) => {
			return (
				<li key={ group.name } className={ 'product-list__column-menu-row' } >
					<div className={ divClasses }>{ group.name }</div>
					{ group.selections.map( ( selection ) => this.renderButton( selection, columnSelections ) ) }
				</li>
			);
		} );
	}

	renderButton( selection, columnSelections ) {
		const isSelected = columnSelections[ selection.key ];

		const buttonClasses = classNames(
			'product-list__column-menu-group-item',
			'product-list__column-menu-button',
			( isSelected
					? 'product-list__column-menu-button-selected'
					: 'product-list__column-menu-button-unselected'
			)
		);
		const onClick = ( evt ) => {
			evt.preventDefault();
			this.props.onColumnSelect( selection, ! isSelected );
		};

		return (
			<Button
				key={ selection.key }
				className={ buttonClasses }
				onClick={ onClick }
			>
				{ selection.title }
			</Button>
		);
	}
}

export default localize( ColumnMenu );
