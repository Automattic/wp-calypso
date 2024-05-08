import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import PopoverMenuSeparator from 'calypso/components/popover-menu/separator';

/**
 * Check if a URL is located outside of Calypso.
 * Note that the check this function implements is incomplete --
 * it only returns false for absolute URLs, so it misses
 * relative URLs, or pure query strings, or hashbangs.
 * @param  url URL to check
 * @returns     true if the given URL is located outside of Calypso
 */
function isOutsideCalypso( url ) {
	return !! url && ( url.startsWith( '//' ) || ! url.startsWith( '/' ) );
}

class ThemeMoreButton extends Component {
	state = { showPopover: false, hasPopoverOpened: false };

	moreButtonRef = createRef();

	togglePopover = () => {
		const shouldOpen = ! this.state.showPopover;
		this.setState( { showPopover: shouldOpen } );

		if ( shouldOpen ) {
			this.props.onMoreButtonClick( this.props.themeId, this.props.index, 'popup_open' );
			if ( ! this.state.hasPopoverOpened ) {
				this.setState( { hasPopoverOpened: true } );
			}
		}
	};

	closePopover = ( action ) => {
		this.setState( { showPopover: false } );
		if ( typeof action === 'function' ) {
			action();
		}
	};

	popoverAction( action, label, key ) {
		return () => {
			action( this.props.themeId, 'more button' );
			this.props.onMoreButtonClick( this.props.themeId, this.props.index, 'popup_' + label );
			this.props.onMoreButtonItemClick?.( this.props.themeId, this.props.index, key );
		};
	}

	render() {
		const { siteId, themeId, themeName, hasStyleVariations, options, active } = this.props;
		const { showPopover, hasPopoverOpened } = this.state;
		const classes = clsx(
			'theme__more-button',
			{ 'is-active': active },
			{ 'is-open': showPopover }
		);

		return (
			<span className={ classes }>
				<button
					aria-label={ `More options for theme ${ themeName }` }
					ref={ this.moreButtonRef }
					onClick={ this.togglePopover }
				>
					<Gridicon icon="ellipsis" size={ 24 } />
				</button>
				{ hasPopoverOpened && hasStyleVariations && (
					<QueryCanonicalTheme themeId={ themeId } siteId={ siteId } />
				) }
				{ showPopover && (
					<PopoverMenu
						context={ this.moreButtonRef.current }
						isVisible
						onClose={ this.closePopover }
						position="top left"
					>
						{ Object.entries( options ).map( ( [ key, option ] ) => {
							if ( option.separator ) {
								return <PopoverMenuSeparator key={ key } />;
							}
							if ( option.getUrl ) {
								const url = option.getUrl( themeId );
								return (
									<PopoverMenuItem
										key={ `${ key }-geturl` }
										action={ this.popoverAction( option.action, option.label, option.key ) }
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
										key={ `${ key }-action` }
										action={ this.popoverAction( option.action, option.label, option.key ) }
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
	siteId: PropTypes.number,
	// Name of theme to give image context.
	themeName: PropTypes.string,
	themeId: PropTypes.string,
	hasStyleVariations: PropTypes.bool,
	// Index of theme in results list
	index: PropTypes.number,
	// More elaborate onClick action, used for tracking.
	// Made to not interfere with DOM onClick
	onMoreButtonClick: PropTypes.func,
	onMoreButtonItemClick: PropTypes.func,
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
