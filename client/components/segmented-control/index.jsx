/** @format */

/**
 * External dependencies
 */

import { filter, map } from 'lodash';
import PropTypes from 'prop-types';
import ReactDom from 'react-dom';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ControlItem from 'components/segmented-control/item';

/**
 * Internal variables
 */
var _instance = 1;

/**
 * SegmentedControl
 */
class SegmentedControl extends React.Component {
	static propTypes = {
		initialSelected: PropTypes.string,
		compact: PropTypes.bool,
		className: PropTypes.string,
		style: PropTypes.object,
		onSelect: PropTypes.func,
		options: PropTypes.arrayOf(
			PropTypes.shape( {
				value: PropTypes.string.isRequired,
				label: PropTypes.string.isRequired,
				path: PropTypes.string,
			} )
		),
	};

	static defaultProps = {
		compact: false,
	};

	constructor( props ) {
		super( props );
		var initialSelected;

		if ( props.options ) {
			initialSelected = props.initialSelected || props.options[ 0 ].value;
		}

		this.state = {
			selected: initialSelected,
			keyboardNavigation: false,
		};
	}

	componentWillMount() {
		this.id = _instance;
		_instance++;
	}

	componentWillUnmount() {
		window.removeEventListener( 'keydown', this.navigateItem );
	}

	render() {
		var segmentedClasses = {
			'segmented-control': true,
			'keyboard-navigation': this.state.keyboardNavigation,
			'is-compact': this.props.compact,
			'is-primary': this.props.primary,
		};

		if ( this.props.className ) {
			this.props.className.split( ' ' ).forEach( function( className ) {
				segmentedClasses[ className ] = true;
			} );
		}

		return (
			<ul
				className={ classNames( segmentedClasses ) }
				style={ this.props.style }
				role="radiogroup"
				onKeyDown={ this.navigateItem }
				onKeyUp={ this.setKeyboardNavigation.bind( this, true ) }
			>
				{ this.getSegmentedItems() }
			</ul>
		);
	}

	getSegmentedItems = () => {
		var refIndex = 0;
		if ( this.props.children ) {
			// add keys and refs to children
			return React.Children.map(
				this.props.children,
				function( child, index ) {
					var newChild = React.cloneElement( child, {
						ref: child.type === ControlItem ? 'item-' + refIndex : null,
						key: 'item-' + index,
						onClick: function( event ) {
							this.setKeyboardNavigation( false );

							if ( typeof child.props.onClick === 'function' ) {
								child.props.onClick( event );
							}
						}.bind( this ),
					} );

					if ( child.type === ControlItem ) {
						refIndex++;
					}

					return newChild;
				},
				this
			);
		}

		return this.props.options.map( function( item, index ) {
			return (
				<ControlItem
					key={ 'segmented-control-' + this.id + '-' + item.value }
					ref={ 'item-' + index }
					selected={ this.state.selected === item.value }
					onClick={ this.selectItem.bind( this, item ) }
					path={ item.path }
					index={ index }
					value={ item.value }
				>
					{ item.label }
				</ControlItem>
			);
		}, this );
	};

	selectItem = option => {
		if ( ! option ) {
			return;
		}

		if ( this.props.onSelect ) {
			this.props.onSelect( option );
		}

		this.setState( {
			selected: option.value,
			keyboardNavigation: false,
		} );
	};

	setKeyboardNavigation = value => {
		this.setState( {
			keyboardNavigation: value,
		} );
	};

	navigateItem = event => {
		switch ( event.keyCode ) {
			case 9: // tab
				this.navigateItemByTabKey( event );
				break;
			case 32: // space
			case 13: // enter
				event.preventDefault();
				document.activeElement.click();
				break;
			case 37: // left arrow
				event.preventDefault();
				this.focusSibling( 'previous' );
				break;
			case 39: // right arrow
				event.preventDefault();
				this.focusSibling( 'next' );
				break;
		}
	};

	navigateItemByTabKey = event => {
		var direction = event.shiftKey ? 'previous' : 'next',
			newIndex = this.focusSibling( direction );

		// allow tabbing out of control
		if ( newIndex !== false ) {
			event.preventDefault();
		}
	};

	/**
	 * Allows for keyboard navigation
	 * @param  {String} direction - `next` or `previous`
	 * @return {Number|Boolean} - returns false if the newIndex is out of bounds
	 */
	focusSibling = direction => {
		var increment, items, newIndex;

		if ( this.props.options ) {
			items = filter( map( this.props.options, 'value' ), Boolean );
		} else {
			items = filter( this.props.children, function( item ) {
				return item.type === ControlItem;
			} );
		}

		if ( typeof this.focused !== 'number' ) {
			this.focused = this.getCurrentFocusedIndex();
		}

		increment = direction === 'previous' ? -1 : 1;
		newIndex = this.focused + increment;
		if ( newIndex >= items.length || newIndex < 0 ) {
			return false;
		}

		ReactDom.findDOMNode( this.refs[ 'item-' + newIndex ].refs.itemLink ).focus();
		this.focused = newIndex;

		return newIndex;
	};

	getCurrentFocusedIndex = () => {
		// item is the <li> element containing the focused link
		var activeItem = document.activeElement.parentNode,
			siblings = Array.prototype.slice( activeItem.parentNode.children ),
			index = siblings.indexOf( activeItem );

		return index > -1 ? index : 0;
	};
}

export default SegmentedControl;
