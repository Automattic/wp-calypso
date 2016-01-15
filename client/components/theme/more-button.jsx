/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:components:themes:more-button' ), // eslint-disable-line no-unused-vars
	classNames = require( 'classnames' ),
	isFunction = require( 'lodash/lang/isFunction' );

/**
 * Internal dependencies
 */
var PopoverMenu = require( 'components/popover/menu' ),
	PopoverMenuItem = require( 'components/popover/menu-item' ),
	isOutsideCalypso = require( 'lib/url' ).isOutsideCalypso,
	getSignupUrl = require( 'lib/themes/helpers' ).getSignupUrl;

/**
 * Component
 */
var ThemeMoreButton = React.createClass( {
	propTypes: {
		// Theme ID (theme-slug)
		id: React.PropTypes.string.isRequired,
		// Index of theme in results list
		index: React.PropTypes.number.isRequired,
		// Options to populate the popover menu with
		options: React.PropTypes.arrayOf(
			React.PropTypes.shape( {
				label: React.PropTypes.string,
				action: React.PropTypes.func,
			} )
		).isRequired,
		active: React.PropTypes.bool
	},

	getInitialState: function() {
		return {
			showPopover: false
		};
	},

	togglePopover: function() {
		this.setState( { showPopover: ! this.state.showPopover } );
		! this.state.showPopover && this.props.onClick( this.props.id, this.props.index );
	},

	closePopover: function( action ) {
		this.setState( { showPopover: false } );
		isFunction( action ) && action();
	},

	focus: function( event ) {
		event.target.focus();
	},

	render: function() {
		var classes = classNames(
			'theme__more-button',
			{ 'is-active': this.props.active },
			{ 'is-open': this.state.showPopover }
		);

		return (
			<span className={ classes }>
				<button ref="more" onClick={ this.togglePopover }>
					<span className="noticon noticon-ellipsis" />
				</button>

				<PopoverMenu context={ this.refs && this.refs.more }
					isVisible={ this.state.showPopover }
					onClose={ this.closePopover }
					position="top left">

					{ this.props.options.map( function( option, index ) {
						if ( option.separator ) {
							return ( <hr key={ 'separator-' + index } className="popover__hr" /> );
						}
						if ( option.url ) {
							return (
								<a className="theme__more-button-menu-item popover__menu-item"
									onMouseOver={ this.focus }
									key={ option.label }
									href={ option.url }
									target={ ( isOutsideCalypso( option.url ) &&
										// We don't want to open a new tab for the signup flow
										// TODO: Remove this hack once we can just hand over
										// to Calypso's signup flow with a theme selected.
										option.url !== getSignupUrl( { id: this.props.id } ) )
										? '_blank' : null }>
									{ option.label }
								</a>
							);
						}
						return (
							<PopoverMenuItem key={ option.label } action={ this.state.showPopover ? option.action() : null }>
								{ option.label }
							</PopoverMenuItem>
						);
					}, this ) }

				</PopoverMenu>
			</span>
		);
	}
} );

module.exports = ThemeMoreButton;
