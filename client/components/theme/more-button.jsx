/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isFunction, map } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import PopoverMenuSeparator from 'components/popover/menu-separator';

/**
 * Check if a URL is located outside of Calypso.
 * Note that the check this function implements is incomplete --
 * it only returns false for absolute URLs, so it misses
 * relative URLs, or pure query strings, or hashbangs.
 *
 * @param  url URL to check
 * @returns     true if the given URL is located outside of Calypso
 */
function isOutsideCalypso( url ) {
	return !! url && ( url.startsWith( '//' ) || ! url.startsWith( '/' ) );
}

class ThemeMoreButton extends Component {
	state = { showPopover: false };

	moreButtonRef = React.createRef();

	togglePopover = () => {
		this.setState( { showPopover: ! this.state.showPopover } );
		! this.state.showPopover &&
			this.props.onMoreButtonClick( this.props.themeId, this.props.index, 'popup_open' );
	};

	closePopover = action => {
		this.setState( { showPopover: false } );
		if ( isFunction( action ) ) {
			action();
		}
	};

	popoverAction( action, label ) {
		return () => {
			action( this.props.themeId );
			this.props.onMoreButtonClick( this.props.themeId, this.props.index, 'popup_' + label );
		};
	}

	render() {
		const classes = classNames(
			'theme__more-button',
			{ 'is-active': this.props.active },
			{ 'is-open': this.state.showPopover }
		);

		return (
			<span className={ classes }>
				<button ref={ this.moreButtonRef } onClick={ this.togglePopover }>
					<Gridicon icon="ellipsis" size={ 24 } />
				</button>

				{ this.state.showPopover && (
					<PopoverMenu
						context={ this.moreButtonRef.current }
						isVisible
						onClose={ this.closePopover }
						position="top left"
					>
						{ map( this.props.options, ( option, key ) => {
							if ( option.separator ) {
								return <PopoverMenuSeparator key={ key } />;
							}
							if ( option.getUrl ) {
								const url = option.getUrl( this.props.themeId );
								return (
									<PopoverMenuItem
										key={ option.label }
										action={ this.popoverAction( option.action, option.label ) }
										href={ url }
										target={ isOutsideCalypso( url ) ? '_blank' : null }
									>
										{ option.label }
									</PopoverMenuItem>
								);
							}
							if ( option.action ) {
								return (
									<PopoverMenuItem
										key={ option.label }
										action={ this.popoverAction( option.action, option.label ) }
									>
										{ option.label }
									</PopoverMenuItem>
								);
							}
							// If neither getUrl() nor action() are specified, filter this option.
							return null;
						} ) }
					</PopoverMenu>
				) }
			</span>
		);
	}
}

ThemeMoreButton.propTypes = {
	themeId: PropTypes.string,
	// Index of theme in results list
	index: PropTypes.number,
	// More elaborate onClick action, used for tracking.
	// Made to not interfere with DOM onClick
	onMoreButtonClick: PropTypes.func,
	// Options to populate the popover menu with
	options: PropTypes.objectOf(
		PropTypes.shape( {
			label: PropTypes.string,
			header: PropTypes.string,
			action: PropTypes.func,
			getUrl: PropTypes.func,
		} )
	).isRequired,
	active: PropTypes.bool,
};

export default ThemeMoreButton;
