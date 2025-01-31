import { withFocusOutside } from '@wordpress/components';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import CloseOnEscape from 'calypso/components/close-on-escape';
import SiteSelector from 'calypso/components/site-selector';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { hasTouch } from 'calypso/lib/touch-detect';
import { hasJetpackActivePlugins, isJetpackSitePred } from 'calypso/state/sites/selectors';
import { setNextLayoutFocus, setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';

/**
 * In order to decide whether to show the site in site selector,
 * we need to know if the site has full Jetpack plugin installed,
 * or if we are on Jetpack Cloud and the site has a Jetpack Standalone plugin installed.
 */
const isJetpackSiteOrJetpackCloud = isJetpackSitePred( {
	considerStandaloneProducts: isJetpackCloud(),
} );

const noop = () => {};

class SitePicker extends Component {
	static displayName = 'SitePicker';

	static propTypes = {
		onClose: PropTypes.func,
		currentLayoutFocus: PropTypes.string,
		setNextLayoutFocus: PropTypes.func.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
		showManageSitesButton: PropTypes.bool,
	};

	static defaultProps = {
		onClose: noop,
	};

	state = {
		isAutoFocused: false,
		isRendered: this.props.currentLayoutFocus === 'sites',
	};

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
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

	handleFocusOutside = () => {
		this.closePicker( null );
	};

	filterSites = ( site ) => {
		// Filter out the sites on WPCOM that don't have full Jetpack plugin installed
		// Such sites should work fine on Jetpack Cloud
		return hasJetpackActivePlugins( site ) ? isJetpackSiteOrJetpackCloud( site ) : true;
	};

	render() {
		return (
			<div>
				<CloseOnEscape onEscape={ this.closePicker } />
				<SiteSelector
					maxResults={ this.props.maxResults }
					showHiddenSites={ this.props.showHiddenSites }
					showManageSitesButton={ this.props.showManageSitesButton }
					isPlaceholder={ ! this.state.isRendered }
					indicator
					showAddNewSite
					showAllSites
					allSitesPath={ this.props.allSitesPath }
					siteBasePath={ this.props.siteBasePath }
					/* eslint-disable-next-line jsx-a11y/no-autofocus */
					autoFocus={ this.state.isAutoFocused }
					onClose={ this.onClose }
					groups
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
	withFocusOutside( SitePicker )
);
