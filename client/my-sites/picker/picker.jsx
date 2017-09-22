/**
 * External dependencies
 */
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import wrapWithClickOutside from 'react-click-outside';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CloseOnEscape from 'components/close-on-escape';
import SiteSelector from 'components/site-selector';
import { hasTouch } from 'lib/touch-detect';
import { setNextLayoutFocus, setLayoutFocus } from 'state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';

const SitePicker = React.createClass( {
	displayName: 'SitePicker',

	propTypes: {
		onClose: PropTypes.func,
		currentLayoutFocus: PropTypes.string,
		setNextLayoutFocus: PropTypes.func.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
	},

	getInitialState: function() {
		return {
			isAutoFocused: false,
			isOpened: false
		};
	},

	getDefaultProps: function() {
		return {
			onClose: noop
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( ! nextProps.currentLayoutFocus || hasTouch() ) {
			return;
		}

		const isAutoFocused = nextProps.currentLayoutFocus === 'sites';
		if ( isAutoFocused !== this.state.isAutoFocused ) {
			this.setState( { isAutoFocused } );
		}
	},

	onClose: function( event ) {
		if ( event.key === 'Escape' ) {
			this.closePicker();
		} else {
			// We use setNext here, because on mobile we want to show sidebar
			// instead of Stats page after picking a site
			this.props.setNextLayoutFocus( 'sidebar' );
			this.scrollToTop();
		}
		this.props.onClose( event );
	},

	scrollToTop: function() {
		document.getElementById( 'secondary' ).scrollTop = 0;
		window.scrollTo( 0, 0 );
	},

	closePicker: function() {
		if ( this.props.currentLayoutFocus === 'sites' ) {
			this.props.setLayoutFocus( 'sidebar' );
			this.scrollToTop();
		}
	},

	handleClickOutside: function() {
		this.closePicker();
	},

	render: function() {
		return (
			<div>
				<CloseOnEscape onEscape={ this.closePicker } />
				<SiteSelector
					ref="siteSelector"
					indicator={ true }
					showAddNewSite={ true }
					showAllSites={ true }
					allSitesPath={ this.props.allSitesPath }
					siteBasePath={ this.props.siteBasePath }
					autoFocus={ this.state.isAutoFocused }
					onClose={ this.onClose }
					groups={ true }
				/>
			</div>
		);
	}
} );

function mapStateToProps( state ) {
	return {
		currentLayoutFocus: getCurrentLayoutFocus( state ),
	};
}

export default connect( mapStateToProps, { setNextLayoutFocus, setLayoutFocus } )( wrapWithClickOutside( SitePicker ) );
