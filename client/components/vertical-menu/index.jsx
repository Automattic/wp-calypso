/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { identity, partial } from 'lodash';

/**
 * Style dependencies
 */
import './style.scss';

export class VerticalMenu extends PureComponent {
	static propTypes = {
		onClick: PropTypes.func,
		initalItemIndex: PropTypes.number,
		children: PropTypes.arrayOf( PropTypes.element ),
	};

	static defaultProps = {
		initialItemIndex: 0,
		onClick: identity,
	};

	constructor( props ) {
		super( props );

		this.state = {
			selectedIndex: props.initialItemIndex,
		};
	}

	select = ( selectedIndex, ...args ) => {
		const { onClick } = this.props;
		this.setState( { selectedIndex }, partial( onClick, ...args ) );
	};

	render() {
		const { children } = this.props;
		const { selectedIndex } = this.state;

		return (
			<div className="vertical-menu">
				{ React.Children.map( children, ( Item, index ) =>
					React.cloneElement( Item, {
						isSelected: index === selectedIndex,
						onClick: partial( this.select, index ),
					} )
				) }
			</div>
		);
	}
}

export default VerticalMenu;
