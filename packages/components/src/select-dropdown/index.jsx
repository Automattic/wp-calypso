import clsx from 'clsx';
import { filter, find, get, noop } from 'lodash';
import PropTypes from 'prop-types';
import { createRef, Children, cloneElement, Component, forwardRef } from 'react';
import Count from '../count';
import Gridicon from '../gridicon';
import DropdownItem from './item';
import DropdownLabel from './label';
import DropdownSeparator from './separator';
import TranslatableString from './translatable/proptype';
import './style.scss';

class SelectDropdown extends Component {
	static Item = DropdownItem;
	static Separator = DropdownSeparator;
	static Label = DropdownLabel;

	static propTypes = {
		id: PropTypes.string,
		selectedText: TranslatableString,
		selectedIcon: PropTypes.element,
		selectedCount: PropTypes.number,
		selectedSecondaryIcon: PropTypes.element,
		positionSelectedSecondaryIconOnRight: PropTypes.bool,
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
				label: PropTypes.oneOfType( [ TranslatableString, PropTypes.node ] ).isRequired,
				path: PropTypes.string,
				icon: PropTypes.element,
				secondaryIcon: PropTypes.element,
				count: PropTypes.number,
			} )
		),
		isLoading: PropTypes.bool,
		ariaLabel: PropTypes.string,
		showSelectedOption: PropTypes.bool,
		children: PropTypes.node,
	};

	static defaultProps = {
		options: [],
		onSelect: noop,
		onToggle: noop,
		style: {},
		showSelectedOption: true,
	};

	instanceId = crypto.randomUUID();

	state = {
		isOpen: false,
		selected: this.getInitialSelectedItem(),
	};

	itemRefs = [];

	setItemRef = ( index ) => ( itemEl ) => {
		this.itemRefs[ index ] = itemEl;
	};

	constructor( props ) {
		super( props );
		this.dropdownContainerRef = props.innerRef ?? createRef();
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

	getSelectedSecondaryIcon() {
		const { options, selectedSecondaryIcon } = this.props;
		const { selected } = this.state;

		if ( selectedSecondaryIcon ) {
			return selectedSecondaryIcon;
		}

		return get( find( options, { value: selected } ), 'secondaryIcon' );
	}

	dropdownOptions() {
		let refIndex = 0;

		if ( this.props.children ) {
			// add refs and focus-on-click handlers to children
			return Children.map( this.props.children, ( child ) => {
				if (
					! child ||
					! [ DropdownItem, DropdownSeparator, DropdownLabel ].includes( child.type )
				) {
					return null;
				}

				return cloneElement( child, {
					ref: child.type === DropdownItem ? this.setItemRef( refIndex++ ) : null,
					onClick: ( event ) => {
						this.dropdownContainerRef.current.focus();
						if ( typeof child.props.onClick === 'function' ) {
							child.props.onClick( event );
						}
					},
				} );
			} );
		}

		return this.props.options
			.filter( ( item ) => {
				if ( this.props.showSelectedOption ) {
					return true;
				}
				return item.value !== this.state.selected;
			} )
			.map( ( item, index ) => {
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
						secondaryIcon={ item.secondaryIcon }
						count={ item.count }
					>
						{ item.label }
					</DropdownItem>
				);
			} );
	}

	render() {
		const dropdownClassName = clsx( 'select-dropdown', this.props.className, {
			'is-compact': this.props.compact,
			'is-open': this.state.isOpen && ! this.props.disabled,
			'is-disabled': this.props.disabled,
			'has-count': 'number' === typeof this.props.selectedCount,
			'is-loading': this.props?.isLoading,
		} );

		const selectedText = this.getSelectedText();
		const selectedIcon = this.getSelectedIcon();
		const selectedSecondaryIcon = this.getSelectedSecondaryIcon();
		const { positionSelectedSecondaryIconOnRight } = this.props;

		return (
			<div id={ this.props.id } style={ this.props.style } className={ dropdownClassName }>
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
						<span className="select-dropdown__header-text" aria-label={ this.props.ariaLabel }>
							{ ! positionSelectedSecondaryIconOnRight && selectedSecondaryIcon }
							{ selectedIcon }
							{ selectedText }
						</span>
						{ 'number' === typeof this.props.selectedCount && (
							<Count count={ this.props.selectedCount } />
						) }
						{ positionSelectedSecondaryIconOnRight && selectedSecondaryIcon }
						<Gridicon icon="chevron-down" size={ 18 } />
					</div>

					<ul
						id={ 'select-submenu-' + this.instanceId }
						className="select-dropdown__options"
						role="listbox"
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
		switch ( event.code ) {
			case 'Tab':
				this.navigateItemByTabKey( event );
				break;
			case 'Space':
			case 'Enter':
				event.preventDefault();
				this.activateItem();
				break;
			case 'ArrowUp':
				event.preventDefault();
				this.focusSibling( 'previous' );
				this.openDropdown();
				break;
			case 'ArrowDown':
				event.preventDefault();
				this.focusSibling( 'next' );
				this.openDropdown();
				break;
			case 'Escape':
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

		let items;
		let focusedIndex;

		if ( this.props.options.length ) {
			items = filter( this.props.options, ( item ) => {
				if ( ! item || item.isLabel ) {
					return false;
				}

				if ( ! this.props.showSelectedOption && item.value === this.state.selected ) {
					return false;
				}

				return true;
			} );

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

export const SelectDropdownForwardingRef = forwardRef( ( props, ref ) => (
	<SelectDropdown { ...props } innerRef={ ref } />
) );
