/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';
import {
	partial
} from 'lodash';

export class VerticalMenu extends PureComponent {
	constructor( props ) {
		super( props );

		this.state = {
			selectedIndex: 0
		};

		this.select = this.select.bind( this );
	}

	select( selectedIndex ) {
		this.setState( { selectedIndex } );
	}

	render() {
		const { children } = this.props;
		const { selectedIndex } = this.state;

		return (
			<div className="vertical-menu">
				{ React.Children.map( children, ( Item, index ) => (
					React.cloneElement( Item, {
						isSelected: index === selectedIndex,
						onClick: partial( this.select, index )
					} )
				) ) }
			</div>
		);
	}
}

VerticalMenu.propTypes = {
	children: PropTypes.arrayOf(
		PropTypes.element
	)
};

export default VerticalMenu;
