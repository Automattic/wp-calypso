/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'gridicons';

const SIDE_PADDING = 50;
const ITEM_WIDTH = 110;

export default class Navbar extends Component {

	static propTypes = {
		children: PropTypes.array.isRequired
	};

	state = {
		collapsed: true,
		foldable: false
	};

	componentDidMount() {
		this.onResize();

		window.addEventListener( 'resize', this.onResize );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.onResize );
	}

	render() {
		const className = classNames(
			'sub-masterbar-nav__navbar',
			{ 'is-collapsed': this.state.collapsed }
		);

		const ellipsisClass = classNames(
			'sub-masterbar-nav__ellipsis',
			{ 'is-open': ! this.state.collapsed }
		);

		return (
			<div className={ className }>
				<div className="sub-masterbar-nav__wrapper">
					<div className="sub-masterbar-nav__items">
						{ this.props.children }
					</div>
				</div>
				{ this.state.foldable && (
					<div className="sub-masterbar-nav__switch">
						<Gridicon icon="ellipsis" className={ ellipsisClass } onClick={ this.toggleList } />
					</div>
				)}
			</div>
		);
	}

	toggleList = () => {
		this.setState( ( state ) => ( {
			collapsed: ! state.collapsed
		} ) );
	}

	onResize = () => {
		const width = findDOMNode( this ).offsetWidth;

		this.setState( ( state, props ) => ( {
			foldable: width < props.children.length * ITEM_WIDTH + SIDE_PADDING
		} ) );
	}
}
