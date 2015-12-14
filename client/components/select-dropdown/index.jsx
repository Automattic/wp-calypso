/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	findWhere = require( 'lodash/collection/findWhere' ),
	filter = require( 'lodash/collection/filter' ),
	findIndex = require( 'lodash/array/findIndex' ),
	map = require( 'lodash/collection/map' ),
	result = require( 'lodash/object/result' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var DropdownItem = require( 'components/select-dropdown/item' ),
	DropdownSeparator = require( 'components/select-dropdown/separator' ),
	Count = require( 'components/count' );

var noop = () => {};

/**
 * Internal variables
 */
var _instance = 1;

/**
 * SelectDropdown
 */
var SelectDropdown = React.createClass( {

	propTypes: {
		selectedText: React.PropTypes.string,
		selectedCount: React.PropTypes.number,
		initialSelected: React.PropTypes.string,
		className: React.PropTypes.string,
		style: React.PropTypes.object,
		onSelect: React.PropTypes.func,
		onToggle: React.PropTypes.func,
		focusSibling: React.PropTypes.func,
		tabIndex: React.PropTypes.number,
		options: React.PropTypes.arrayOf(
			React.PropTypes.shape( {
				value: React.PropTypes.string.isRequired,
				label: React.PropTypes.string.isRequired,
				path: React.PropTypes.string
			} )
		)
	},

	getDefaultProps: function() {
		return {
			onSelect: noop,
			onToggle: noop,
			style: {}
		};
	},

	getInitialState: function() {
		var initialState = {
			isOpen: false
		};

		if ( this.props.options ) {
			initialState.selected = this.props.initialSelected ||
				this.props.options[ 0 ].value;
		}

		return initialState;
	},

	componentWillMount: function() {
		this.id = _instance;
		_instance++;
	},

	componentWillReceiveProps: function() {
		if ( this.state.isOpen ) {
			this.closeDropdown();
		}
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'click', this.handleOutsideClick );
	},

	componentDidUpdate: function( prevProps, prevState ) {
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
	},

	dropdownOptions: function() {
		var refIndex = 0;
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
						this.refs.dropdownContainer.focus();
						if ( typeof child.props.onClick === 'function' ) {
							child.props.onClick( event );
						}
					}.bind( this )
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
						key={ 'dropdown-separator-' + this.id + '-' + index }
					/>
				);
			}

			let dropdownItem = (
				<DropdownItem
					key={ 'dropdown-item-' + this.id + '-' + item.value }
					ref={ 'item-' + refIndex }
					selected={ this.state.selected === item.value }
					onClick={ this.selectItem.bind( this, item ) }
					path={ item.path }
				>
					{ item.label }
				</DropdownItem>
			);

			refIndex++;

			return dropdownItem;
		}, this );
	},

	render: function() {
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
			: result( findWhere(
				this.props.options, { value: this.state.selected }
			), 'label' );

		return (
			<div style={ this.props.style } className={ dropdownClassName }>
				<div
					ref="dropdownContainer"
					className="select-dropdown__container"
					onKeyDown={ this.navigateItem }
					tabIndex={ this.props.tabIndex || 0 }
					aria-haspopup="true"
					aria-owns={ 'select-submenu-' + this.id }
					aria-controls={ 'select-submenu-' + this.id }
					aria-expanded={ this.state.isOpen }
					onClick={ this.toggleDropdown }
				>
					<div
						id={ 'select-dropdown-' + this.id }
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
						id={ 'select-submenu-' + this.id }
						className="select-dropdown__options"
						role="menu"
						aria-labelledby={ 'select-dropdown-' + this.id }
						aria-expanded={ this.state.isOpen }
					>
						{ this.dropdownOptions() }
					</ul>
				</div>
			</div>
		);
	},

	toggleDropdown: function() {
		this.setState( {
			isOpen: ! this.state.isOpen
		} );
	},

	openDropdown: function() {
		this.setState( {
			isOpen: true
		} );
	},

	closeDropdown: function() {
		if ( this.state.isOpen ) {
			delete this.focused;
			this.setState( {
				isOpen: false
			} );
		}
	},

	selectItem: function( option ) {
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
	},

	navigateItem: function( event ) {
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
	},

	navigateItemByTabKey: function( event ) {
		var direction;
		if ( ! this.state.isOpen ) {
			return;
		}
		event.preventDefault();
		direction = ( event.shiftKey ) ? 'previous' : 'next';
		this.focusSibling( direction );
	},

	activateItem: function() {
		if ( ! this.state.isOpen ) {
			return this.openDropdown();
		}
		document.activeElement.click();
	},

	focusSibling: function( direction ) {
		var increment, items, focusedIndex, newIndex;

		// the initial up-arrow/down-arrow should only open the menu
		if ( ! this.state.isOpen ) {
			return;
		}

		if ( this.props.options ) {
			items = filter( map( this.props.options, 'value' ), Boolean );
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
	},

	handleOutsideClick: function( event ) {
		if ( ! ReactDom.findDOMNode( this.refs.dropdownContainer ).contains( event.target ) ) {
			this.closeDropdown();
		}
	},
} );

module.exports = SelectDropdown;
