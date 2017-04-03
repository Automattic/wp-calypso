/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import { find } from 'lodash';

import Gridicon from 'gridicons';
import Item from './item';

const VIEW_BREAKPOINT = 660;
const VIEW_PADDING = 50;
const ITEM_WIDTH = 110;

export default class SubMasterbarNav extends Component {
	static propTypes = {
		fallback: PropTypes.shape(
			{
				label: PropTypes.string.isRequired,
				uri: PropTypes.string.isRequired,
				icon: PropTypes.string
			}
		),
		options: PropTypes.arrayOf(
			PropTypes.shape( {
				label: PropTypes.string.isRequired,
				uri: PropTypes.string.isRequired,
				icon: PropTypes.string
			} )
		),
		uri: PropTypes.string.isRequired
	};

	static defaultProps = {
		options: []
	}

	state = {
		collapsed: true
	};

	componentDidMount() {
		this.onResize();

		window.addEventListener( 'resize', this.onResize );
		window.addEventListener( 'scroll', this.onScroll );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.onResize );
		window.removeEventListener( 'scroll', this.onScroll );
	}

	render() {
		const className = classNames(
			'sub-masterbar-nav',
			{ 'is-collapsed': this.state.collapsed }
		);

		const ellipsisClass = classNames(
			'sub-masterbar-nav__ellipsis',
			{ 'is-open': ! this.state.collapsed }
		);

		return (
			<div className={ className }>
				{ this.isDroppable( this.state.width ) &&
					<div className="sub-masterbar-nav__select" onClick={ this.toggleList }>
						<Item
							isSelected={ true }
							label={ this.getSelected().label }
							icon={ this.getSelected().icon }
						/>
						<Gridicon icon="chevron-down" className="sub-masterbar-nav__select-icon" />
					</div>
				}
				<div className="sub-masterbar-nav__wrapper">
					<div className="sub-masterbar-nav__items">
						{ this.renderItems() }
					</div>
				</div>
				{ this.isFoldable( this.state.width, this.props.options ) && (
					<div className="sub-masterbar-nav__switch">
						<Gridicon icon="ellipsis" className={ ellipsisClass } onClick={ this.toggleList } />
					</div>
				)}
			</div>
		);
	}

	renderItems() {
		return this.props.options.map( ( item, index ) =>
			<Item
				key={ index }
				isSelected={ this.isSelected( item ) }
				onClick={ this.onSelect }
				label={ item.label }
				icon={ item.icon }
				href={ item.uri }
			/>
		);
	}

	toggleList = () => {
		this.setState( ( state ) => ( {
			collapsed: ! state.collapsed
		} ) );
	}

	onSelect = () => {
		this.setState( ( state ) => ( {
			collapsed: this.isDroppable( state.width ) || state.collapsed
		} ) );
	}

	onScroll = () => {
		this.setState( ( state ) => ( {
			collapsed: state.collapsed || this.isDroppable( state.width )
		} ) );
	}

	onResize = () => {
		const currentWidth = findDOMNode( this ).offsetWidth;

		this.setState( ( state, props ) => ( {
			width: currentWidth,
			collapsed: state.collapsed || this.hasChangedView( state.width, currentWidth, props.options )
		} ) );
	}

	hasChangedView( oldWidth, newWidth, options ) {
		const min = Math.min( oldWidth, newWidth );
		const max = Math.max( oldWidth, newWidth );

		return ( this.isDroppable( min ) && ! this.isDroppable( max ) ) ||
			( this.isFoldable( min, options ) && ! this.isFoldable( max, options ) );
	}

	isFoldable( width, options ) {
		return VIEW_BREAKPOINT < width && width < options.length * ITEM_WIDTH + VIEW_PADDING;
	}

	isDroppable( width ) {
		return width <= VIEW_BREAKPOINT;
	}

	isSelected( option ) {
		return option.uri === this.props.uri;
	}

	getSelected() {
		return find( this.props.options, ( option ) => this.isSelected( option ) ) || this.props.fallback;
	}
}
