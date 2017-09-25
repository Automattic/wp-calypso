/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

class WidgetGroup extends Component {
	static defaultProps = {
		maxColumns: 2,
	}

	static propTypes = {
		children: PropTypes.oneOfType( [
			PropTypes.arrayOf( PropTypes.node ),
			PropTypes.node
		] ),
		className: PropTypes.string,
		maxColumns: PropTypes.number,
		title: PropTypes.string,
	}

	/*
	 * We render a single row of widgets (using cloneElement to
	 * properly merge the widget's classname with a row-item class name
	 * in order to take advantage of flexbox without introducing further
	 * nesting)
	 */
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

	/*
	 * A widget group will have one or more children. This method slices
	 * the array of children into rows containing maxColumns children
	 * and uses renderRow to assemble each of those rows
	 */
	renderChildren = () => {
		const { children, firstWidgetFullWidth, maxColumns } = this.props;

		const rows = [];
		let childIndex = 0;
		let rowIndex = 0;

		if ( ! Array.isArray( children ) ) {
			rows.push( this.renderRow( rowIndex, [ children ] ) );
		} else {
			if ( firstWidgetFullWidth ) {
				rows.push( this.renderRow( rowIndex, children ) );
				childIndex = 1;
			}

			while ( childIndex < children.length ) {
				rowIndex++;
				rows.push( this.renderRow( rowIndex, children.slice( childIndex, maxColumns ) ) );
				childIndex += maxColumns;
			}
		}

		return (
			<div className="widget-group__rows">
				{ rows }
			</div>
		);
	}

	render = () => {
		const { children, className, title } = this.props;
		const classes = classNames( 'widget-group__group-container', className );

		return (
			<div className={ classes } >
				{ title && ( <h2>{ title }</h2> ) }
				{ children && this.renderChildren() }
			</div>
		);
	}
}

export default WidgetGroup;
