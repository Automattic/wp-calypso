/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import isFunction from 'lodash/isFunction';
import map from 'lodash/map';

/**
 * Internal dependencies
 */
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import { isOutsideCalypso } from 'lib/url';

/**
 * Component
 */
class ThemeMoreButton extends React.Component {

	constructor( props ) {
		super( props );
		this.state = { showPopover: false };
		this.togglePopover = this.togglePopover.bind( this );
		this.closePopover = this.closePopover.bind( this );
		this.onClick = this.onClick.bind( this );
		this.onPopoverActionClick = this.onPopoverActionClick.bind( this );
	}

	togglePopover() {
		this.setState( { showPopover: ! this.state.showPopover } );
		! this.state.showPopover && this.props.onMoreButtonClick( this.props.theme, this.props.index, 'popup_open' );
	}

	closePopover( action ) {
		this.setState( { showPopover: false } );
		if ( isFunction( action ) ) {
			action();
		}
	}

	popoverAction( action, label ) {
		action( this.props.theme.id );
		this.props.onMoreButtonClick( this.props.theme, this.props.index, 'popup_' + label );
	}

	onPopoverActionClick( action, label ) {
		return () => this.popoverAction( action, label );
	}

	focus( event ) {
		event.target.focus();
	}

	onClick( action, label ) {
		return this.closePopover.bind( this, this.onPopoverActionClick( action, label ) );
	}

	render() {
		const classes = classNames(
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

					{ map( this.props.options, function( option, key ) {
						if ( option.separator ) {
							return ( <hr key={ key } className="popover__hr" /> );
						}
						if ( option.getUrl ) {
							const url = option.getUrl( this.props.theme.id );
							return (
								<a className="theme__more-button-menu-item popover__menu-item"
									onMouseOver={ this.focus }
									onClick={ this.onClick( option.action, option.label ) }
									key={ option.label }
									href={ url }
									target={ isOutsideCalypso( url ) ? '_blank' : null }>
									{ option.label }
								</a>
							);
						}
						if ( option.action ) {
							return (
								<PopoverMenuItem
									key={ option.label }
									action={ this.onPopoverActionClick( option.action, option.label ) }>
									{ option.label }
								</PopoverMenuItem>
							);
						}
						// If neither getUrl() nor action() are specified, filter this option.
						return null;
					}.bind( this ) ) }

				</PopoverMenu>
			</span>
		);
	}
}

ThemeMoreButton.propTypes = {
	// See Theme component propTypes
	theme: React.PropTypes.object,
	// Index of theme in results list
	index: React.PropTypes.number,
	// More elaborate onClick action, used for tracking.
	// Made to not interfere with DOM onClick
	onMoreButtonClick: React.PropTypes.func,
	// Options to populate the popover menu with
	options: React.PropTypes.objectOf(
		React.PropTypes.shape( {
			label: React.PropTypes.string,
			header: React.PropTypes.string,
			action: React.PropTypes.func,
			getUrl: React.PropTypes.func
		} )
	).isRequired,
	active: React.PropTypes.bool
};

export default ThemeMoreButton;
