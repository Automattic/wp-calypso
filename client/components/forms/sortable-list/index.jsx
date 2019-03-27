/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { assign, findIndex, fromPairs, noop } from 'lodash';
import classNames from 'classnames';
import debugFactory from 'debug';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import ScreenReaderText from 'components/screen-reader-text';
import { hasTouch } from 'lib/touch-detect';

const debug = debugFactory( 'calypso:forms:sortable-list' );

/**
 * Style dependencies
 */
import './style.scss';

class SortableList extends React.Component {
	static propTypes = {
		direction: PropTypes.oneOf( [ 'horizontal', 'vertical' ] ),
		allowDrag: PropTypes.bool,
		onChange: PropTypes.func,
	};

	static defaultProps = {
		direction: 'horizontal',
		allowDrag: true,
		onChange: noop,
	};

	state = {
		activeIndex: null,
		activeOrder: null,
		position: null,
	};

	listRef = React.createRef();
	itemsRefs = new Map();
	itemShadowRefs = new Map();

	componentWillMount() {
		debug( 'Mounting ' + this.constructor.displayName + ' React component.' );
	}

	componentDidMount() {
		if ( ! hasTouch() ) {
			document.addEventListener( 'mousemove', this.onMouseMove );
			document.addEventListener( 'mouseup', this.onMouseUp );
		}
	}

	componentWillUnmount() {
		document.removeEventListener( 'mousemove', this.onMouseMove );
		document.removeEventListener( 'mouseup', this.onMouseUp );
	}

	getPositionForCursorElement = ( element, event ) => {
		return {
			top: event.clientY - element.clientHeight / 2,
			left: event.clientX - element.clientWidth / 2,
		};
	};

	compareCursorVerticalToElement = ( element, event ) => {
		const rect = element.getBoundingClientRect();

		if ( event.clientY < rect.top ) {
			return -1;
		} else if ( event.clientY > rect.bottom ) {
			return 1;
		}
		return 0;
	};

	isCursorBeyondElementThreshold = ( element, direction, permittedVertical, event ) => {
		const rect = element.getBoundingClientRect();

		// We check for Y bounds on right and left and not X bounds for top
		// and bottom because horizontal lists can have line breaks, so we
		// should be careful to consider vertical position in those cases
		switch ( direction ) {
			case 'top':
				return event.clientY <= rect.top + rect.height / 2;
			case 'right':
				return (
					event.clientX >= rect.left + rect.width / 2 &&
					( 'top' === permittedVertical || event.clientY >= rect.top ) &&
					( 'bottom' === permittedVertical || event.clientY <= rect.bottom )
				);
			case 'bottom':
				return event.clientY >= rect.top + rect.height / 2;
			case 'left':
				return (
					event.clientX <= rect.left + rect.width / 2 &&
					( 'top' === permittedVertical || event.clientY >= rect.top ) &&
					( 'bottom' === permittedVertical || event.clientY <= rect.bottom )
				);
			default:
				return false;
		}
	};

	getAdjustedElementIndex = index => {
		// The active order array is used as an array where each index matches
		// the original prop children indices, but the values correspond to
		// their visible position index
		if ( this.state.activeOrder ) {
			return this.state.activeOrder[ index ];
		}
		return index;
	};

	getCursorElementIndex = event => {
		const cursorCompare = this.compareCursorVerticalToElement( this.listRef.current, event );
		const adjustedActiveIndex = this.getAdjustedElementIndex( this.state.activeIndex );
		const shadowRect = this.itemShadowRefs
			.get( 'wrap-shadow-' + this.state.activeIndex )
			.current.getBoundingClientRect();

		const index = findIndex( this.props.children, ( child, i ) => {
			let isBeyond, permittedVertical;

			// Avoid self-comparisons for the active item
			if ( i === this.state.activeIndex ) {
				return false;
			}

			// Since elements are now shifted around, we want to find their
			// visible position to make accurate comparisons
			const adjustedElementIndex = this.getAdjustedElementIndex( i );

			// When rearranging on a horizontal plane, permit breaking of
			// vertical if the cursor is outside the list element on the
			// same vertical, and only if the element is on the same line as
			// the active item's shadow element
			if ( 'horizontal' === this.props.direction ) {
				if (
					1 === cursorCompare &&
					this.itemsRefs.get( 'wrap-' + i ).current.getBoundingClientRect().top >= shadowRect.top
				) {
					permittedVertical = 'bottom';
				} else if (
					-1 === cursorCompare &&
					this.itemsRefs.get( 'wrap-' + i ).current.getBoundingClientRect().bottom <=
						shadowRect.bottom
				) {
					permittedVertical = 'top';
				}
			}

			if ( adjustedElementIndex < adjustedActiveIndex ) {
				// If the item which is currently before the active item is
				// suddenly after, return this item's index
				isBeyond = this.isCursorBeyondElementThreshold(
					this.itemsRefs.get( 'wrap-' + i ).current,
					'horizontal' === this.props.direction ? 'left' : 'top',
					permittedVertical,
					event
				);
			} else if ( adjustedElementIndex > adjustedActiveIndex ) {
				// If the item which is currently after the active item is
				// suddenly before, return this item's index
				isBeyond =
					isBeyond ||
					this.isCursorBeyondElementThreshold(
						this.itemsRefs.get( 'wrap-' + i ).current,
						'horizontal' === this.props.direction ? 'right' : 'bottom',
						permittedVertical,
						event
					);
			}

			return isBeyond;
		} );

		return this.getAdjustedElementIndex( index );
	};

	moveItem = direction => {
		const increment = 'previous' === direction ? -1 : 1,
			activeOrder = Object.keys( this.props.children ).map( Number );

		activeOrder[ this.state.activeIndex + increment ] = this.state.activeIndex;
		activeOrder[ this.state.activeIndex ] = this.state.activeIndex + increment;

		this.props.onChange( activeOrder );

		this.setState( {
			activeIndex: activeOrder[ this.state.activeIndex ],
		} );
	};

	onMouseDown = ( index, event ) => {
		this.setState( {
			activeIndex: index,
			position: this.getPositionForCursorElement( event.currentTarget.firstChild, event ),
		} );
	};

	onMouseMove = event => {
		let activeOrder;
		if ( null === this.state.activeIndex || ! this.props.allowDrag || hasTouch() ) {
			return;
		}

		activeOrder = this.state.activeOrder;

		// Find the new cursor location
		const newIndex = this.getCursorElementIndex( event );
		if ( newIndex >= 0 ) {
			if ( this.state.activeIndex === newIndex ) {
				// If we're changing the index back to the active item's
				// original position, we can shortcut this by simply
				// setting the order back to default
				activeOrder = null;
			} else {
				// Create an ordered array of items using the index from
				// the child props array
				activeOrder = Object.keys( this.props.children ).map( Number );

				for ( let i = 0, il = activeOrder.length; i < il; i++ ) {
					if ( i >= newIndex && i < this.state.activeIndex ) {
						// Bump up any item below the active index and
						// above the new index
						activeOrder[ i ] = i + 1;
					} else if ( i <= newIndex && i > this.state.activeIndex ) {
						// Bump down any item above the active index
						// and below the new index
						activeOrder[ i ] = i - 1;
					}
				}

				// Set the new index for the active item
				activeOrder[ this.state.activeIndex ] = newIndex;
			}
		}

		this.setState( {
			position: this.getPositionForCursorElement(
				this.itemsRefs.get( 'wrap-' + this.state.activeIndex ).current.firstChild,
				event
			),
			activeOrder: activeOrder,
		} );
	};

	onMouseUp = () => {
		if ( this.state.activeOrder ) {
			this.props.onChange( this.state.activeOrder );
		}

		this.setState( {
			activeIndex: null,
			activeOrder: null,
			position: null,
		} );
	};

	onClick = index => {
		this.setState( {
			activeIndex: index,
		} );
	};

	getOrderedListItemElements = () => {
		this.itemsRefs.clear();
		this.itemShadowRefs.clear();
		return React.Children.map(
			this.props.children,
			function( child, index ) {
				const isActive = this.state.activeIndex === index;
				const isDraggable = this.props.allowDrag && ! hasTouch();
				let events = isDraggable ? [ 'onMouseDown', 'onMouseUp' ] : [ 'onClick' ];
				const style = { order: this.getAdjustedElementIndex( index ) };
				const classes = classNames( {
					'sortable-list__item': true,
					'is-active': isActive,
					'is-draggable': isDraggable,
				} );

				events = fromPairs(
					events.map( function( event ) {
						return [ event, this[ event ].bind( null, index ) ];
					}, this )
				);

				if ( isActive ) {
					assign( style, this.state.position );
				}
				const itemRef = React.createRef();
				this.itemsRefs.set( 'wrap-' + index, itemRef );
				const item = (
					<li
						ref={ itemRef }
						key={ 'wrap-' + index }
						{ ...events }
						className={ classes }
						style={ style }
					>
						{ child }
					</li>
				);

				if ( isActive && isDraggable ) {
					const shadowRef = React.createRef();
					this.itemShadowRefs.set( 'wrap-shadow-' + index, shadowRef );
					return [
						<li
							ref={ shadowRef }
							key={ 'wrap-shadow-' + index }
							className="sortable-list__item is-shadow"
							style={ style }
						>
							{ child }
						</li>,
						item,
					];
				}
				return item;
			},
			this
		);
	};

	getNavigationElement = () => {
		if ( this.props.allowDrag && ! hasTouch() ) {
			return;
		}

		return (
			<div className="sortable-list__navigation">
				<button
					type="button"
					onClick={ this.moveItem.bind( null, 'previous' ) }
					className="sortable-list__navigation-button is-previous"
					disabled={ null === this.state.activeIndex || this.state.activeIndex === 0 }
				>
					<ScreenReaderText>{ this.props.translate( 'Move previous' ) }</ScreenReaderText>
					<Gridicon icon="chevron-down" size={ 24 } />
				</button>
				<button
					type="button"
					onClick={ this.moveItem.bind( null, 'next' ) }
					className="sortable-list__navigation-button is-next"
					disabled={
						null === this.state.activeIndex ||
						this.state.activeIndex === this.props.children.length - 1
					}
				>
					<ScreenReaderText>{ this.props.translate( 'Move next' ) }</ScreenReaderText>
					<Gridicon icon="chevron-up" size={ 24 } />
				</button>
			</div>
		);
	};

	render() {
		const classes = classNames( {
			'sortable-list': true,
			'is-horizontal': 'horizontal' === this.props.direction,
			'is-vertical': 'vertical' === this.props.direction,
		} );

		return (
			<div className={ classes }>
				<ol ref={ this.listRef } className="sortable-list__list">
					{ this.getOrderedListItemElements() }
				</ol>
				{ this.getNavigationElement() }
			</div>
		);
	}
}

export default localize( SortableList );
