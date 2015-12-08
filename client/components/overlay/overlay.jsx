/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	debug = require( 'debug' )( 'calypso:overlay' ),
	classes = require( 'component-classes' );

/**
 * Internal dependencies
 */
var Toolbar = require( './toolbar' ),
	GlobalNotices = require( 'notices/global-notices' ),
	NoticesList = require( 'notices/notices-list' ),
	notices = require( 'notices' ),
	page = require( 'page' ),
	TitleData = require( 'components/data/screen-title' );

module.exports = React.createClass({
	displayName: 'Overlay',

	getDefaultProps: function() {
		return {
			closeOnESC: true,
			// `sectionID` is used to namespace the overlay wrapper classes
			sectionID: ''
		};
	},

	/**
	 * When overlay will be mounted add `overlay-open` class
	 * to the document html element to display it
	 */
	componentWillMount: function() {
		debug( 'Mounting overlay component.' );
	},

	componentDidMount: function() {
		setTimeout( function() {
			classes( document.documentElement ).add( 'overlay-open' ).add( 'animate' ).add( 'overlay-is-front' );
		}, 10 );

		// Register listeners for `keydown` and `click` within #tertiary to close the overlay
		if ( this.props.closeOnESC ) {
			window.addEventListener( 'keydown', this.handleKeyPress );
		}

		document.getElementById( 'tertiary' ).addEventListener( 'click', this.handleClickWithinOverlay );
	},

	/**
 	 * When overlay is going to be unmounted remove the `overlay-open`
	 * class from the document html element to animate it out
	 * and remove `overlay-is-front` when the animation has completed
 	 */
	componentWillUnmount: function() {
		debug( 'Unmounting overlay component.' );
		classes( document.documentElement ).remove( 'overlay-open' ).remove( 'animate' );
		window.removeEventListener( 'keydown', this.handleKeyPress );
		document.getElementById( 'tertiary' ).removeEventListener( 'click', this.handleClickWithinOverlay );
	},

	closeOverlay: function() {
		page( this.getDefaultBack() );
	},

	getDefaultBack: function() {
		var context = this.props.context || {},
			defaultBack = this.props.secondary.defaultBack || '/sites';

		if ( context.prevPath && context.prevPath !== context.path ) {
			defaultBack = context.prevPath;
		}
		return defaultBack;
	},

	handleKeyPress: function( event ) {
		// 'esc' key closes the overlay
		if ( event.keyCode === 27 ) {
			this.closeOverlay();
		}
	},

	handleClickWithinOverlay: function( event ) {
		if ( ! this.refs.overlayInnerContent.getDOMNode().contains( event.target ) ) {
			this.closeOverlay();
		}
	},

	render: function() {
		var overlayClass = 'overlay-content slide-in-up ' + this.props.sectionID,
			secondary = ( typeof this.props.secondary !== 'undefined' ) ? this.props.secondary : { title: this.translate( 'Done' ) };

		return (
			<section className={ overlayClass } id="overlay-content">
				<TitleData>
					<Toolbar
						primary={ this.props.primary }
						secondary={ secondary }
						context={ this.props.context }
						back={ this.getDefaultBack() } />
				</TitleData>

				<div className="wp-content" ref="overlayInnerContent">
					<NoticesList id="overlay-notices" notices={ notices.list }/>
					<GlobalNotices id="overlay-notices" />
					{ this.props.children }
				</div>
			</section>
		);
	}

});
