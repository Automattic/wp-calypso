/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	debug = require( 'debug' )( 'calypso:components:themes:more-button' ), // eslint-disable-line no-unused-vars
	classNames = require( 'classnames' ),
	isFunction = require( 'lodash/lang/isFunction' );

/**
 * Internal dependencies
 */
var PopoverMenu = require( 'components/popover/menu' ),
	PopoverMenuItem = require( 'components/popover/menu-item' ),
	isOutsideCalypso = require( 'lib/url' ).isOutsideCalypso;

/**
 * Component
 */
var ThemeMoreButton = React.createClass( {
	propTypes: {
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
		! this.state.showPopover && this.props.onClick();
	},

	closePopover: function( action ) {
		this.setState( { showPopover: false } );
		isFunction( action ) && action();
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
									onMouseOver={ event => {
										event.target.focus();
									} }
									key={ option.label }
									href={ option.url }
									target={ isOutsideCalypso( option.url ) ? '_blank' : null }>
									{ option.label }
								</a>
							);
						}
						return (
							<PopoverMenuItem key={ option.label } action={ option.action }>
								{ option.label }
							</PopoverMenuItem>
						);
					} ) }

				</PopoverMenu>
			</span>
		);
	}
} );

module.exports = ThemeMoreButton;
