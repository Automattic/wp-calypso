import PropTypes from 'prop-types';
import { Component } from 'react';
import wrapWithClickOutside from 'react-click-outside';
import { connect } from 'react-redux';
import CloseOnEscape from 'calypso/components/close-on-escape';
import SiteSelector from 'calypso/components/site-selector';
import { hasTouch } from 'calypso/lib/touch-detect';
import { setNextLayoutFocus, setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';

const noop = () => {};

class SitePicker extends Component {
	static displayName = 'SitePicker';

	static propTypes = {
		onClose: PropTypes.func,
		currentLayoutFocus: PropTypes.string,
		setNextLayoutFocus: PropTypes.func.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
	};

	static defaultProps = {
		onClose: noop,
	};

	state = {
		isAutoFocused: false,
		isRendered: this.props.currentLayoutFocus === 'sites',
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.currentLayoutFocus === 'sites' && ! this.state.isRendered ) {
			this.setState( { isRendered: true } );
		}

		if ( ! nextProps.currentLayoutFocus || hasTouch() ) {
			return;
		}

		const isAutoFocused = nextProps.currentLayoutFocus === 'sites';
		if ( isAutoFocused !== this.state.isAutoFocused ) {
			this.setState( { isAutoFocused } );
		}
	}

	onClose = ( event, selectedSiteId ) => {
		if ( event.key === 'Escape' ) {
			this.closePicker();
		} else {
			// We use setNext here, because on mobile we want to show sidebar
			// instead of Stats page after picking a site
			this.props.setNextLayoutFocus( 'sidebar' );
			if ( selectedSiteId ) {
				this.scrollToTop();
			}
		}
		this.props.onClose( event, selectedSiteId );
	};

	scrollToTop = () => {
		document.getElementById( 'secondary' ).scrollTop = 0;
		window.scrollTo( 0, 0 );
	};

	closePicker = ( selectedSiteId ) => {
		if ( this.props.currentLayoutFocus === 'sites' ) {
			this.props.setLayoutFocus( 'sidebar' );
			if ( selectedSiteId ) {
				this.scrollToTop();
			}
		}
	};

	handleClickOutside = () => {
		this.closePicker( null );
	};

	filterSites = ( site ) => {
		return site?.options?.jetpack_connection_active_plugins
			? site.options.jetpack_connection_active_plugins.includes( 'jetpack' )
			: true;
	};

	render() {
		return (
			<div>
				<CloseOnEscape onEscape={ this.closePicker } />
				<SiteSelector
					isPlaceholder={ ! this.state.isRendered }
					indicator={ true }
					showAddNewSite={ true }
					showAllSites={ true }
					allSitesPath={ this.props.allSitesPath }
					siteBasePath={ this.props.siteBasePath }
					/* eslint-disable-next-line jsx-a11y/no-autofocus */
					autoFocus={ this.state.isAutoFocused }
					onClose={ this.onClose }
					groups={ true }
					filter={ this.filterSites }
				/>
			</div>
		);
	}
}

function mapStateToProps( state ) {
	return {
		currentLayoutFocus: getCurrentLayoutFocus( state ),
	};
}

export default connect( mapStateToProps, { setNextLayoutFocus, setLayoutFocus } )(
	wrapWithClickOutside( SitePicker )
);
