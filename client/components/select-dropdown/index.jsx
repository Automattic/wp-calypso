/** @ssr-ready **/

/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import find from 'lodash/find';
import filter from 'lodash/filter';
import findIndex from 'lodash/findIndex';
import map from 'lodash/map';
import result from 'lodash/result';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import DropdownItem from 'components/select-dropdown/item';
import DropdownSeparator from 'components/select-dropdown/separator';
import DropdownLabel from 'components/select-dropdown/label';
import Count from 'components/count';

/**
 * Module variables
 */
const { Component, PropTypes } = React;
var noop = () => {};

/**
 * SelectDropdown
 */

class SelectDropdown extends Component {
	constructor( props ) {
		super( props );

		// bounds
		this.navigateItem = this.navigateItem.bind( this );
		this.toggleDropdown = this.toggleDropdown.bind( this );
		this.handleOutsideClick = this.handleOutsideClick.bind( this );

		// state
		let initialState = { isOpen: false };

		if ( props.options.length ) {
			initialState.selected = this.getInitialSelectedItem( props );
		}

		this.state = initialState;
	}

	componentWillMount() {
		this.setState( {
			instanceId: ++SelectDropdown.instances
		} );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.state.isOpen ) {
			this.closeDropdown();
		}

		if (
			typeof this.state.selected !== 'undefined' &&
			this.props.initialSelected !== nextProps.initialSelected
		) {
			this.setState( { selected: nextProps.initialSelected } );
		}
	}

	componentWillUnmount() {
		window.removeEventListener( 'click', this.handleOutsideClick );
	}

	componentDidUpdate( prevProps, prevState ) {
		if ( this.state.isOpen ) {
			window.addEventListener( 'click', this.handleOutsideClick );
		} else {
			window.removeEventListener( 'click', this.handleOutsideClick );
		}

		if ( this.state.isOpen !== prevState.isOpen ) {
			this.props.onToggle( {
				target: this,
				open: this.state.isOpen
			} );
		}
	}

	getInitialSelectedItem( props ) {
		props = props || this.props;

		if ( props.initialSelected ) {
			return props.initialSelected;
		}

		if ( ! props.options.length ) {
			return;
		}

		const selectedItem = find( props.options, value => ! value.isLabel );
		return selectedItem && selectedItem.value;
	}

	dropdownOptions() {
		var refIndex = 0;
		var self = this;

		if ( this.props.children ) {
			// add keys and refs to children
			return React.Children.map( this.props.children, function( child, index ) {
				if ( ! child ) {
					return null;
				}

				let newChild = React.cloneElement( child, {
					ref: ( child.type === DropdownItem ) ? 'item-' + refIndex : null,
					key: 'item-' + index,
					onClick: function( event ) {
						self.refs.dropdownContainer.focus();
						if ( typeof child.props.onClick === 'function' ) {
							child.props.onClick( event );
						}
					}
				} );

				if ( child.type === DropdownItem ) {
					refIndex++;
				}

				return newChild;
			}, this );
		}

		return this.props.options.map( function( item, index ) {
			if ( ! item ) {
				return (
					<DropdownSeparator
						key={ 'dropdown-separator-' + this.state.instanceId + '-' + index }
					/>
				);
			}

			if ( item.isLabel ) {
				return (
					<DropdownLabel
						key={ 'dropdown-label-' + this.state.instanceId + '-' + index }
					>
						{ item.label }
					</DropdownLabel>
				);
			}

			let dropdownItem = (
				<DropdownItem
					key={ 'dropdown-item-' + this.state.instanceId + '-' + item.value }
					ref={ 'item-' + refIndex }
					selected={ this.state.selected === item.value }
					onClick={ this.onSelectItem( item ) }
					path={ item.path }
				>
					{ item.label }
				</DropdownItem>
			);

			refIndex++;

			return dropdownItem;
		}, this );
	}

	render() {
		const dropdownClasses = {
			'select-dropdown': true,
			'is-compact': this.props.compact,
			'is-open': this.state.isOpen
		};

		if ( this.props.className ) {
			this.props.className.split( ' ' ).forEach( function( className ) {
				dropdownClasses[ className ] = true;
			} );
		}

		let dropdownClassName = classNames( dropdownClasses );
		let selectedText = this.props.selectedText
			? this.props.selectedText
			: result( find(
				this.props.options, { value: this.state.selected }
			), 'label' );

		return (
			<div style={ this.props.style } className={ dropdownClassName }>
				<div
					ref="dropdownContainer"
					className="select-dropdown__container"
					valueLink={ this.props.valueLink }
					onKeyDown={ this.navigateItem }
					tabIndex={ this.props.tabIndex || 0 }
					aria-haspopup="true"
					aria-owns={ 'select-submenu-' + this.state.instanceId }
					aria-controls={ 'select-submenu-' + this.state.instanceId }
					aria-expanded={ this.state.isOpen }
					data-tip-target={ this.props.tipTarget }
					onClick={ this.toggleDropdown }
				>
					<div
						id={ 'select-dropdown-' + this.state.instanceId }
						className="select-dropdown__header"
					>
						<span className="select-dropdown__header-text">
							{ selectedText }
							{
								'number' === typeof this.props.selectedCount &&
								<Count count={ this.props.selectedCount } />
							}
						</span>
					</div>

					<ul
						id={ 'select-submenu-' + this.state.instanceId }
						className="select-dropdown__options"
						role="menu"
						aria-labelledby={ 'select-dropdown-' + this.state.instanceId }
						aria-expanded={ this.state.isOpen }
					>
						{ this.dropdownOptions() }
					</ul>
				</div>
			</div>
		);
	}

	toggleDropdown() {
		this.setState( {
			isOpen: ! this.state.isOpen
		} );
	}

	openDropdown() {
		this.setState( {
			isOpen: true
		} );
	}

	closeDropdown() {
		if ( this.state.isOpen ) {
			delete this.focused;
			this.setState( {
				isOpen: false
			} );
		}
	}

	onSelectItem( option ) {
		return this.selectItem.bind( this, option );
	}

	selectItem( option ) {
		if ( ! option ) {
			return;
		}

		if ( this.props.onSelect ) {
			this.props.onSelect( option );
		}

		this.setState( {
			selected: option.value
		} );

		this.refs.dropdownContainer.focus();
	}

	navigateItem( event ) {
		switch ( event.keyCode ) {
			case 9: //tab
				this.navigateItemByTabKey( event );
				break;
			case 32: // space
			case 13: // enter
				event.preventDefault();
				this.activateItem();
				break;
			case 38: // up arrow
				event.preventDefault();
				this.focusSibling( 'previous' );
				this.openDropdown();
				break;
			case 40: // down arrow
				event.preventDefault();
				this.focusSibling( 'next' );
				this.openDropdown();
				break;
			case 27: // escape
				event.preventDefault();
				this.closeDropdown();
				this.refs.dropdownContainer.focus();
				break;
		}
	}

	navigateItemByTabKey( event ) {
		var direction;
		if ( ! this.state.isOpen ) {
			return;
		}
		event.preventDefault();
		direction = ( event.shiftKey ) ? 'previous' : 'next';
		this.focusSibling( direction );
	}

	activateItem() {
		if ( ! this.state.isOpen ) {
			return this.openDropdown();
		}
		document.activeElement.click();
	}

	focusSibling( direction ) {
		var increment, items, focusedIndex, newIndex;

		// the initial up-arrow/down-arrow should only open the menu
		if ( ! this.state.isOpen ) {
			return;
		}

		if ( this.props.options.length ) {
			items = map( filter( this.props.options, item => {
				return item && ! item.isLabel;
			} ), 'value' );

			focusedIndex = typeof this.focused === 'number'
				? this.focused
				: items.indexOf( this.state.selected );
		} else {
			items = filter( this.props.children, function( item ) {
				return item.type === DropdownItem;
			} );

			focusedIndex = typeof this.focused === 'number'
				? this.focused
				: findIndex( items, function( item ) {
					return item.props.selected;
				} );
		}

		increment = ( direction === 'previous' ) ? -1 : 1;
		newIndex = focusedIndex + increment;

		if ( newIndex >= items.length || newIndex < 0 ) {
			return;
		}

		ReactDom.findDOMNode( this.refs[ 'item-' + newIndex ].refs.itemLink ).focus();
		this.focused = newIndex;
	}

	handleOutsideClick( event ) {
		if ( ! ReactDom.findDOMNode( this.refs.dropdownContainer ).contains( event.target ) ) {
			this.closeDropdown();
		}
	}
};

SelectDropdown.defaultProps = {
	options: [],
	onSelect: noop,
	onToggle: noop,
	style: {}
};

SelectDropdown.propTypes = {
	selectedText: PropTypes.string,
	selectedCount: PropTypes.number,
	initialSelected: PropTypes.string,
	className: PropTypes.string,
	style: PropTypes.object,
	onSelect: PropTypes.func,
	onToggle: PropTypes.func,
	focusSibling: PropTypes.func,
	tabIndex: PropTypes.number,
	options: PropTypes.arrayOf(
		PropTypes.shape( {
			value: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired,
			path: PropTypes.string
		} )
	)
};

// statics
SelectDropdown.instances = 0;

export default SelectDropdown;
