/** @format */

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
import touchDetect from 'lib/touch-detect';

const debug = debugFactory( 'calypso:forms:sortable-list' );

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

	componentWillMount() {
		debug( 'Mounting ' + this.constructor.displayName + ' React component.' );
	}

	componentDidMount() {
		document.addEventListener( 'mousemove', this.onMouseMove );
		document.addEventListener( 'mouseup', this.onMouseUp );
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
		var rect = element.getBoundingClientRect();

		if ( event.clientY < rect.top ) {
			return -1;
		} else if ( event.clientY > rect.bottom ) {
			return 1;
		} else {
			return 0;
		}
	};

	isCursorBeyondElementThreshold = ( element, direction, permittedVertical, event ) => {
		var rect = element.getBoundingClientRect();

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
		} else {
			return index;
		}
	};

	getCursorElementIndex = event => {
		var cursorCompare = this.compareCursorVerticalToElement( this.refs.list, event ),
			adjustedActiveIndex = this.getAdjustedElementIndex( this.state.activeIndex ),
			shadowRect = this.refs[ 'wrap-shadow-' + this.state.activeIndex ].getBoundingClientRect(),
			index;

		index = findIndex( this.props.children, ( child, i ) => {
			var isBeyond, adjustedElementIndex, permittedVertical;

			// Avoid self-comparisons for the active item
			if ( i === this.state.activeIndex ) {
				return false;
			}

			// Since elements are now shifted around, we want to find their
			// visible position to make accurate comparisons
			adjustedElementIndex = this.getAdjustedElementIndex( i );

			// When rearranging on a horizontal plane, permit breaking of
			// vertical if the cursor is outside the list element on the
			// same vertical, and only if the element is on the same line as
			// the active item's shadow element
			if ( 'horizontal' === this.props.direction ) {
				if (
					1 === cursorCompare &&
					this.refs[ 'wrap-' + i ].getBoundingClientRect().top >= shadowRect.top
				) {
					permittedVertical = 'bottom';
				} else if (
					-1 === cursorCompare &&
					this.refs[ 'wrap-' + i ].getBoundingClientRect().bottom <= shadowRect.bottom
				) {
					permittedVertical = 'top';
				}
			}

			if ( adjustedElementIndex < adjustedActiveIndex ) {
				// If the item which is currently before the active item is
				// suddenly after, return this item's index
				isBeyond = this.isCursorBeyondElementThreshold(
					this.refs[ 'wrap-' + i ],
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
						this.refs[ 'wrap-' + i ],
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
		var increment = 'previous' === direction ? -1 : 1,
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
		var activeOrder, newIndex;
		if ( null === this.state.activeIndex || ! this.props.allowDrag || touchDetect.hasTouch() ) {
			return;
		}

		activeOrder = this.state.activeOrder;

		// Find the new cursor location
		newIndex = this.getCursorElementIndex( event );
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

				for ( var i = 0, il = activeOrder.length; i < il; i++ ) {
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
				this.refs[ 'wrap-' + this.state.activeIndex ].firstChild,
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
		return React.Children.map(
			this.props.children,
			function( child, index ) {
				var isActive = this.state.activeIndex === index,
					isDraggable = this.props.allowDrag && ! touchDetect.hasTouch(),
					events = isDraggable ? [ 'onMouseDown', 'onMouseUp' ] : [ 'onClick' ],
					style = { order: this.getAdjustedElementIndex( index ) },
					classes = classNames( {
						'sortable-list__item': true,
						'is-active': isActive,
						'is-draggable': isDraggable,
					} ),
					item;

				events = fromPairs(
					events.map( function( event ) {
						return [ event, this[ event ].bind( null, index ) ];
					}, this )
				);

				if ( isActive ) {
					assign( style, this.state.position );
				}

				item = (
					<li
						ref={ 'wrap-' + index }
						key={ 'wrap-' + index }
						{ ...events }
						className={ classes }
						style={ style }
					>
						{ child }
					</li>
				);

				if ( isActive && isDraggable ) {
					return [
						<li
							ref={ 'wrap-shadow-' + index }
							key={ 'wrap-shadow-' + index }
							className="sortable-list__item is-shadow"
							style={ style }
						>
							{ child }
						</li>,
						item,
					];
				} else {
					return item;
				}
			},
			this
		);
	};

	getNavigationElement = () => {
		if ( this.props.allowDrag && ! touchDetect.hasTouch() ) {
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
					<span className="screen-reader-text">{ this.props.translate( 'Move previous' ) }</span>
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
					<span className="screen-reader-text">{ this.props.translate( 'Move next' ) }</span>
					<Gridicon icon="chevron-up" size={ 24 } />
				</button>
			</div>
		);
	};

	render() {
		var classes = classNames( {
			'sortable-list': true,
			'is-horizontal': 'horizontal' === this.props.direction,
			'is-vertical': 'vertical' === this.props.direction,
		} );

		return (
			<div className={ classes }>
				<ol ref="list" className="sortable-list__list">
					{ this.getOrderedListItemElements() }
				</ol>
				{ this.getNavigationElement() }
			</div>
		);
	}
}

export default localize( SortableList );
