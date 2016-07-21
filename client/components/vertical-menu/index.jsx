/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';
import {
	identity,
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

	select( selectedIndex, ...args ) {
		const { onClick } = this.props;

		this.setState( { selectedIndex }, partial( onClick, ...args ) );
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
	onClick: PropTypes.func,
	children: PropTypes.arrayOf(
		PropTypes.element
	)
};

VerticalMenu.defaultProps = {
	onClick: identity
};

export default VerticalMenu;
