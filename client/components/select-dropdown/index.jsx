/**
 * External Dependencies
 */
import ReactDom from 'react-dom';
import React, { Component, PropTypes } from 'react';
import find from 'lodash/find';
import filter from 'lodash/filter';
import findIndex from 'lodash/findIndex';
import map from 'lodash/map';
import get from 'lodash/get';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import DropdownItem from 'components/select-dropdown/item';
import DropdownSeparator from 'components/select-dropdown/separator';
import DropdownLabel from 'components/select-dropdown/label';
import Count from 'components/count';
import Gridicon from 'gridicons';

/**
 * SelectDropdown
 */
class SelectDropdown extends Component {
	static propTypes = {
		selectedText: PropTypes.string,
		selectedCount: PropTypes.number,
		selectedIcon: PropTypes.string,
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
	}

	static defaultProps = {
		options: [],
		onSelect: () => {},
		onToggle: () => {},
		style: {}
	}

	static instances = 0

	constructor( props ) {
		super( props );

		// bounds
		this.navigateItem = this.navigateItem.bind( this );
		this.toggleDropdown = this.toggleDropdown.bind( this );
		this.handleOutsideClick = this.handleOutsideClick.bind( this );

		// state
		const initialState = { isOpen: false };

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

	getSelectedObject() {
		const { options } = this.props;
		const { selected } = this.state;

		// return currently selected object
		const selectedValue = selected ? selected : this.getInitialSelectedItem( this.props );
		return find( options, { value: selectedValue } );
	}

	getSelectedText() {
		const { selectedText } = this.props;
		return selectedText ? selectedText : get( this.getSelectedObject(), 'label' );
	}

	dropdownOptions() {
		let refIndex = 0;
		const self = this;

		if ( this.props.children ) {
			// add keys and refs to children
			return React.Children.map( this.props.children, function( child, index ) {
				if ( ! child ) {
					return null;
				}

				const newChild = React.cloneElement( child, {
					ref: ( child.type === DropdownItem ) ? 'item-' + refIndex : null,
					key: 'item-' + index,
					isDropdownOpen: this.state.isOpen,
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

			const dropdownItem = (
				<DropdownItem
					key={ 'dropdown-item-' + this.state.instanceId + '-' + item.value }
					ref={ 'item-' + refIndex }
					isDropdownOpen={ this.state.isOpen }
					selected={ this.state.selected === item.value }
					onClick={ this.onSelectItem( item ) }
					path={ item.path }
					icon={ item.icon }
					count={ item.count }
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

		const dropdownClassName = classNames( dropdownClasses );

		const selectedItem = this.getSelectedObject();
		const selectedIcon = this.props.selectedIcon || get( selectedItem, 'icon' );
		const selectedCount = this.props.selectedCount || get( selectedItem, 'count' );
		const selectedText = this.props.selectedText || get( selectedItem, 'label' );

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
							{
								selectedIcon &&
								<Gridicon
									icon={ selectedIcon }
									size={ this.props.compact ? 18 : 24 }
									className="select-dropdown__icon"
								/>
							}
							{ selectedText }
						</span>
						{
							'number' === typeof selectedCount &&
							<Count count={ selectedCount } />
						}
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
		if ( ! this.state.isOpen ) {
			return;
		}

		event.preventDefault();

		const direction = ( event.shiftKey ) ? 'previous' : 'next';
		this.focusSibling( direction );
	}

	activateItem() {
		if ( ! this.state.isOpen ) {
			return this.openDropdown();
		}
		document.activeElement.click();
	}

	focusSibling( direction ) {
		// the initial up-arrow/down-arrow should only open the menu
		if ( ! this.state.isOpen ) {
			return;
		}

		let items, focusedIndex;

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

		const increment = ( direction === 'previous' ) ? -1 : 1;
		const newIndex = focusedIndex + increment;

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
}

export default SelectDropdown;
