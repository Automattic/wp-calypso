/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import {
	partial
} from 'lodash';

export class VerticalSelector extends Component {
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
			<div className="vertical-selector">
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

VerticalSelector.propTypes = {
	children: PropTypes.arrayOf(
		PropTypes.element
	)
};

export default VerticalSelector;
