/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	noop = require( 'lodash/utility/noop' );

/**
 * Internal dependencies
 */
var SiteSelector = require( 'components/site-selector' ),
	hasTouch = require( 'lib/touch-detect' ).hasTouch;

module.exports = React.createClass( {
	displayName: 'SitePicker',

	propTypes: {
		onClose: React.PropTypes.func,
		layoutFocus: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			isAutoFocused: false
		};
	},

	getDefaultProps: function() {
		return {
			onClose: noop
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( ! nextProps.layoutFocus || hasTouch() ) {
			return;
		}

		// The 200ms delay here is necessary to accomodate for LayoutFocus
		// toggling the visibility of inactive views via `setFocusHideClass`
		clearTimeout( this._autofocusTimeout );
		this._autofocusTimeout = setTimeout( function() {
			this.setState( {
				isAutoFocused: nextProps.layoutFocus.getCurrent() === 'sites'
			} );
		}.bind( this ), 200 );
	},

	componentDidUpdate: function() {
		// Register a document level event listener
		// only when the picker is opened.
		//
		// This is used to detect clicks outside the picker
		// in order to close it.
		if ( this.props.layoutFocus && this.props.layoutFocus.getCurrent() === 'sites' ) {
			document.addEventListener( 'click', this.closePickerOnOutsideClick );
		} else {
			document.removeEventListener( 'click', this.closePickerOnOutsideClick );
		}
	},

	componentWillUnmount: function() {
		document.removeEventListener( 'click', this.closePickerOnOutsideClick );

		clearTimeout( this._autofocusTimeout );
		this._autofocusTimeout = null;
	},

	onClose: function( event ) {
		this.props.layoutFocus && this.props.layoutFocus.setNext( 'sidebar' );
		this.scrollToTop();
		this.props.onClose( event );
	},

	scrollToTop: function() {
		document.getElementById( 'secondary' ).scrollTop = 0;
		window.scrollTo( 0, 0 );
	},

	closePickerOnOutsideClick: function( event ) {
		var pickerNode = ReactDom.findDOMNode( this.refs.siteSelector );

		// If the user clicks outside the Picker, let's close it
		if ( ! pickerNode.contains( event.target ) && event.target !== pickerNode ) {
			this.props.layoutFocus && this.props.layoutFocus.set( 'sidebar' );
			this.scrollToTop();
		}
	},

	render: function() {
		return (
			<SiteSelector
				ref="siteSelector"
				indicator={ true }
				showAddNewSite={ true }
				showAllSites={ true }
				sites={ this.props.sites }
				allSitesPath={ this.props.allSitesPath }
				siteBasePath={ this.props.siteBasePath }
				user={ this.props.user }
				autoFocus={ this.state.isAutoFocused }
				onClose={ this.onClose }
			/>
		);
	}
} );
