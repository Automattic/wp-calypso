/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */

class WidgetGroup extends Component {
	static propTypes = {
		children: PropTypes.oneOfType( [
			PropTypes.arrayOf( PropTypes.node ),
			PropTypes.node
		] ),
		className: PropTypes.string,
		maxColumns: PropTypes.number,
		title: PropTypes.string,
	}

	renderRow = ( rowIndex, children ) => {
		return (
			<div className="widget-group__row-container" key={ rowIndex }>
				{ children.map( ( child, index ) => {
					return React.cloneElement( child, {
						className: classNames( child.props.className, 'widget-group__row-item', 'card' ),
						key: index,
					} );
				} ) }
			</div>
		);
	}

	renderChildren = () => {
		const { children, firstWidgetFullWidth, maxColumns } = this.props;

		const rows = [];
		let childIndex = 0;
		let rowIndex = 0;

		if ( ! Array.isArray( children ) ) {
			rows.push( this.renderRow( rowIndex, children ) );
		} else {
			if ( firstWidgetFullWidth ) {
				rows.push( this.renderRow( rowIndex, children ) );
				childIndex = 1;
			}

			do {
				rowIndex++;
				rows.push( this.renderRow( rowIndex, children.slice( childIndex, maxColumns ) ) );
				childIndex += maxColumns;
			} while ( childIndex < children.length );
		}

		return (
			<div className="widget-group__rows">
				{ rows }
			</div>
		);
	}

	render = () => {
		const { children, className, title } = this.props;
		const classes = classNames( {
			'widget-group__group-container': true,
		}, className );

		return (
			<div className={ classes } >
				{ title && ( <h2>{ title }</h2> ) }
				{ children && this.renderChildren() }
			</div>
		);
	}
}

WidgetGroup.defaultProps = {
	maxColumns: 2
};

export default WidgetGroup;
