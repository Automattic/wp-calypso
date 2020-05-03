/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { filter, find, get, noop } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import DropdownItem from './item';
import DropdownSeparator from './separator';
import DropdownLabel from './label';
import Count from 'components/count';
import TranslatableString from 'components/translatable/proptype';

/**
 * Style dependencies
 */
import './style.scss';

class SelectDropdown extends Component {
	static Item = DropdownItem;
	static Separator = DropdownSeparator;
	static Label = DropdownLabel;

	static propTypes = {
		selectedText: TranslatableString,
		selectedIcon: PropTypes.element,
		selectedCount: PropTypes.number,
		initialSelected: PropTypes.string,
		className: PropTypes.string,
		style: PropTypes.object,
		onSelect: PropTypes.func,
		onToggle: PropTypes.func,
		focusSibling: PropTypes.func,
		tabIndex: PropTypes.number,
		disabled: PropTypes.bool,
		options: PropTypes.arrayOf(
			PropTypes.shape( {
				value: PropTypes.string.isRequired,
				label: TranslatableString.isRequired,
				path: PropTypes.string,
				icon: PropTypes.element,
			} )
		),
	};

	static defaultProps = {
		options: [],
		onSelect: noop,
		onToggle: noop,
		style: {},
	};

	static instances = 0;

	instanceId = ++SelectDropdown.instances;

	state = {
		isOpen: false,
		selected: this.getInitialSelectedItem(),
	};

	dropdownContainerRef = React.createRef();

	itemRefs = [];

	setItemRef = ( index ) => ( itemEl ) => {
		this.itemRefs[ index ] = itemEl;
	};

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
				open: this.state.isOpen,
			} );
		}
	}

	getInitialSelectedItem() {
		// This method is only useful for the case when the component is uncontrolled, i.e., the
		// selected state is in local state as opposed to being maintained by parent container.
		// The `SelectDropdown` is uncontrolled iff the items are specified as `options` prop.
		// (And is controlled when the items are specified as `children`.)
		if ( ! this.props.options.length ) {
			return undefined;
		}

		// Use the `initialSelected` prop if specified
		if ( this.props.initialSelected ) {
			return this.props.initialSelected;
		}

		// Otherwise find the first option that is an item, i.e., not label or separator
		return get(
			find( this.props.options, ( item ) => item && ! item.isLabel ),
			'value'
		);
	}

	getSelectedText() {
		const { options, selectedText } = this.props;
		const { selected } = this.state;

		if ( selectedText ) {
			return selectedText;
		}

		// return currently selected text
		return get( find( options, { value: selected } ), 'label' );
	}

	getSelectedIcon() {
		const { options, selectedIcon } = this.props;
		const { selected } = this.state;

		if ( selectedIcon ) {
			return selectedIcon;
		}

		// return currently selected icon
		return get( find( options, { value: selected } ), 'icon' );
	}

	dropdownOptions() {
		let refIndex = 0;

		if ( this.props.children ) {
			// add refs and focus-on-click handlers to children
			return React.Children.map( this.props.children, ( child ) => {
				if ( ! child || child.type !== DropdownItem ) {
					return null;
				}

				return React.cloneElement( child, {
					ref: this.setItemRef( refIndex++ ),
					onClick: ( event ) => {
						this.dropdownContainerRef.current.focus();
						if ( typeof child.props.onClick === 'function' ) {
							child.props.onClick( event );
						}
					},
				} );
			} );
		}

		return this.props.options.map( ( item, index ) => {
			if ( ! item ) {
				return <DropdownSeparator key={ 'dropdown-separator-' + index } />;
			}

			if ( item.isLabel ) {
				return <DropdownLabel key={ 'dropdown-label-' + index }>{ item.label }</DropdownLabel>;
			}

			return (
				<DropdownItem
					key={ 'dropdown-item-' + item.value }
					ref={ this.setItemRef( refIndex++ ) }
					selected={ this.state.selected === item.value }
					onClick={ this.onSelectItem( item ) }
					path={ item.path }
					icon={ item.icon }
				>
					{ item.label }
				</DropdownItem>
			);
		} );
	}

	render() {
		const dropdownClassName = classNames( 'select-dropdown', this.props.className, {
			'is-compact': this.props.compact,
			'is-open': this.state.isOpen && ! this.props.disabled,
			'is-disabled': this.props.disabled,
			'has-count': 'number' === typeof this.props.selectedCount,
		} );

		const selectedText = this.getSelectedText();
		const selectedIcon = this.getSelectedIcon();

		return (
			<div style={ this.props.style } className={ dropdownClassName }>
				<div
					ref={ this.dropdownContainerRef }
					className="select-dropdown__container"
					onKeyDown={ this.navigateItem }
					tabIndex={ this.props.tabIndex || 0 }
					role="button"
					aria-haspopup="true"
					aria-owns={ 'select-submenu-' + this.instanceId }
					aria-controls={ 'select-submenu-' + this.instanceId }
					aria-expanded={ this.state.isOpen }
					aria-disabled={ this.props.disabled }
					data-tip-target={ this.props.tipTarget }
					onClick={ this.toggleDropdown }
				>
					<div id={ 'select-dropdown-' + this.instanceId } className="select-dropdown__header">
						<span className="select-dropdown__header-text">
							{ selectedIcon && selectedIcon.type === Gridicon ? selectedIcon : null }
							{ selectedText }
						</span>
						{ 'number' === typeof this.props.selectedCount && (
							<Count count={ this.props.selectedCount } />
						) }
						<Gridicon icon="chevron-down" size={ 18 } />
					</div>

					<ul
						id={ 'select-submenu-' + this.instanceId }
						className="select-dropdown__options"
						role="menu"
						aria-labelledby={ 'select-dropdown-' + this.instanceId }
						aria-expanded={ this.state.isOpen }
					>
						{ this.dropdownOptions() }
					</ul>
				</div>
			</div>
		);
	}

	toggleDropdown = () => {
		if ( this.props && this.props.disabled ) {
			return;
		}

		this.setState( {
			isOpen: ! this.state.isOpen,
		} );
	};

	openDropdown() {
		if ( this.props && this.props.disabled ) {
			return;
		}
		this.setState( {
			isOpen: true,
		} );
	}

	closeDropdown() {
		if ( this.state.isOpen ) {
			delete this.focused;
			this.setState( {
				isOpen: false,
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
			selected: option.value,
		} );

		this.dropdownContainerRef.current.focus();
	}

	navigateItem = ( event ) => {
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
				this.dropdownContainerRef.current.focus();
				break;
		}
	};

	navigateItemByTabKey( event ) {
		if ( ! this.state.isOpen ) {
			return;
		}

		event.preventDefault();

		const direction = event.shiftKey ? 'previous' : 'next';
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
			items = filter( this.props.options, ( item ) => item && ! item.isLabel );

			focusedIndex =
				typeof this.focused === 'number'
					? this.focused
					: items.findIndex( ( item ) => item.value === this.state.selected );
		} else {
			items = filter( this.props.children, ( item ) => item.type === DropdownItem );

			focusedIndex =
				typeof this.focused === 'number'
					? this.focused
					: items.findIndex( ( item ) => item.props.selected );
		}

		const increment = direction === 'previous' ? -1 : 1;
		const newIndex = focusedIndex + increment;

		if ( newIndex >= items.length || newIndex < 0 ) {
			return;
		}

		this.itemRefs[ newIndex ].focusLink();
		this.focused = newIndex;
	}

	handleOutsideClick = ( event ) => {
		if ( ! this.dropdownContainerRef.current.contains( event.target ) ) {
			this.closeDropdown();
		}
	};
}

export default SelectDropdown;
