import clsx from 'clsx';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { createRef, PureComponent } from 'react';
import { connect } from 'react-redux';
import Site from 'calypso/blocks/site';
import SitePlaceholder from 'calypso/blocks/site/placeholder';
import SiteSelector from 'calypso/components/site-selector';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';

import './style.scss';

const noop = () => {};

export class SitesDropdown extends PureComponent {
	componentRef = createRef();
	isMouseEvent = false;

	static propTypes = {
		selectedSiteId: PropTypes.number,
		showAllSites: PropTypes.bool,
		onClose: PropTypes.func,
		onSiteSelect: PropTypes.func,
		open: PropTypes.bool,
		filter: PropTypes.func,
		isPlaceholder: PropTypes.bool,
		hasMultipleSites: PropTypes.bool,
		disabled: PropTypes.bool,
		hideDeleted: PropTypes.bool,
	};

	static defaultProps = {
		showAllSites: false,
		onClose: noop,
		onSiteSelect: noop,
		open: false,
		isPlaceholder: false,
		hasMultipleSites: false,
		disabled: false,
		hideDeleted: true,
	};

	constructor( props ) {
		super( props );

		// needed to be done in constructor b/c spy tests
		this.selectSite = this.selectSite.bind( this );
		this.siteFilter = this.siteFilter.bind( this );
		this.toggleOpen = this.toggleOpen.bind( this );
		this.onClickOutside = this.onClickOutside.bind( this );
		this.onFocusOutside = this.onFocusOutside.bind( this );
		this.onClose = this.onClose.bind( this );

		this.state = {
			selectedSiteId: this.props.selectedSiteId || this.props.primarySiteId,
		};
	}

	componentDidMount() {
		document.addEventListener( 'mousedown', this.onClickOutside );
	}

	componentWillUnmount() {
		document.removeEventListener( 'mousedown', this.onClickOutside );
	}

	onClickOutside( event ) {
		if (
			this.state.open &&
			! this.componentRef.current?.contains( event.target ) // Check if click is outside the container.
		) {
			this.onClose( event );
		}
	}

	/**
	 * Handle closing the dropdown when focus moves outside using Keyboard navigation.
	 */
	onFocusOutside( event ) {
		// If its a mouse event, don't do anything.
		// This fixes an issue where blur have relevantTarget set in modal contexts and that closes the dropdown
		// before click event can be handled.
		if ( this.isMouseEvent ) {
			this.isMouseEvent = false;
			return;
		}

		// relatedTarget is the element receiving focus. If it's outside the container, close the dropdown.
		const { relatedTarget } = event;
		if ( relatedTarget && ! this.componentRef.current?.contains( relatedTarget ) ) {
			this.onClose( event );
		}
	}

	selectSite( siteId ) {
		this.props.onSiteSelect( siteId );
		this.setState( {
			selectedSiteId: siteId,
			open: false,
		} );
	}

	// Our filter prop handles siteIds, while SiteSelector's filter prop needs objects
	siteFilter( site ) {
		if ( this.props.hideDeleted && site.is_deleted ) {
			return false;
		}

		return this.props.filter?.( site.ID ) ?? true;
	}

	toggleOpen() {
		this.props.hasMultipleSites && this.setState( { open: ! this.state.open } );
	}

	onClose( e ) {
		this.setState( { open: false } );
		this.props.onClose && this.props.onClose( e );
	}

	handleKeyDown = ( event ) => {
		if ( event.key === 'Enter' || event.keyCode === 13 ) {
			// Without this event.preventDefault, this keydown event will
			// somehow trigger the site selector to navigate to /me/?
			// though it's unclear why. This seems related to the
			// fact that pressing Enter while focused on a blank search input
			// on the /me/account page will also cause navigation to happen.
			// We can remove this once we find out how to prevent that
			// erroneous navigation from happening with the search input.
			if ( ! this.state.open ) {
				event.preventDefault();
			}
			this.toggleOpen( event );
		}

		if ( this.state.open && event.key === 'Escape' ) {
			event.preventDefault();
			this.onClose( event );
			// Return focus to the dropdown toggle.
			this.componentRef.current?.querySelector( '.sites-dropdown__selected' )?.focus();
			return;
		}
	};

	render() {
		return (
			// eslint-disable-next-line jsx-a11y/no-static-element-interactions
			<div
				ref={ this.componentRef }
				className={ clsx(
					'sites-dropdown',
					{ 'is-open': this.state.open },
					{ 'is-disabled': this.props.disabled },
					{ 'has-multiple-sites': this.props.hasMultipleSites }
				) }
				onMouseDown={ () => ( this.isMouseEvent = true ) }
				onBlur={ this.onFocusOutside }
			>
				<div className="sites-dropdown__wrapper">
					{ /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */ }
					<div
						className="sites-dropdown__selected"
						onClick={ this.toggleOpen }
						onKeyDown={ this.handleKeyDown }
						// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
						tabIndex={ 0 }
					>
						{ this.props.isPlaceholder ? (
							<SitePlaceholder />
						) : (
							<Site
								siteId={ this.state.selectedSiteId }
								indicator={ false }
								iconSize={ 36 }
								showChevronDownIcon={ this.props.hasMultipleSites }
							/>
						) }
					</div>
					{ this.props.hasMultipleSites && this.state.open && (
						<SiteSelector
							// eslint-disable-next-line jsx-a11y/no-autofocus
							autoFocus
							onClose={ this.onClose }
							onKeyDown={ this.handleKeyDown }
							onSiteSelect={ this.selectSite }
							selected={ this.state.selectedSiteId }
							hideSelected
							filter={ this.siteFilter }
						/>
					) }
				</div>
			</div>
		);
	}
}

export default connect( ( state ) => ( {
	primarySiteId: getPrimarySiteId( state ),
	hasMultipleSites: get( getCurrentUser( state ), 'site_count', 1 ) > 1,
} ) )( SitesDropdown );
