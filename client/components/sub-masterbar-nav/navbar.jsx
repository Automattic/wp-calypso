/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Item from './item';

const SIDE_PADDING = 50;
const ITEM_WIDTH = 110;

const OptionShape = PropTypes.shape( {
	label: PropTypes.string.isRequired,
	uri: PropTypes.string.isRequired,
	icon: PropTypes.string,
} );

export default class Navbar extends Component {
	static propTypes = {
		selected: OptionShape,
		options: PropTypes.arrayOf( OptionShape ),
	};

	state = {
		collapsed: true,
		foldable: false,
	};

	componentDidMount() {
		this.onResize();

		window.addEventListener( 'resize', this.onResize );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.onResize );
	}

	render() {
		const className = classNames( 'sub-masterbar-nav__navbar', {
			'is-collapsed': this.state.collapsed,
		} );

		const ellipsisClass = classNames( 'sub-masterbar-nav__ellipsis', {
			'is-open': ! this.state.collapsed,
		} );

		return (
			<div className={ className }>
				<div className="sub-masterbar-nav__wrapper">
					<div className="sub-masterbar-nav__items">
						{ this.props.options.map( this.renderItem ) }
					</div>
				</div>
				{ this.state.foldable && (
					<div className="sub-masterbar-nav__switch">
						<Gridicon icon="ellipsis" className={ ellipsisClass } onClick={ this.toggleList } />
					</div>
				) }
			</div>
		);
	}

	renderItem = ( item, index ) => {
		return (
			<Item
				key={ index }
				isSelected={ item === this.props.selected }
				label={ item.label }
				icon={ item.icon }
				href={ item.uri }
			/>
		);
	};

	toggleList = () => {
		this.setState( ( state ) => ( {
			collapsed: ! state.collapsed,
		} ) );
	};

	onResize = () => {
		const width = findDOMNode( this ).offsetWidth;

		this.setState( ( state, props ) => ( {
			foldable: width < props.options.length * ITEM_WIDTH + SIDE_PADDING,
		} ) );
	};
}
