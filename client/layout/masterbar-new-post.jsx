/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	user = require( 'lib/user' )(),
	paths = require( 'lib/paths' ),
	viewport = require( 'lib/viewport' ),
	SitesPopover = require( 'components/sites-popover' );

import Gridicon from 'components/gridicon';

module.exports = React.createClass( {
	displayName: 'MasterbarNewPost',

	_preloaded: false,

	propTypes: {
		sites: React.PropTypes.object,
		active: React.PropTypes.bool,
		className: React.PropTypes.string
	},

	getInitialState: function() {
		return {
			isShowingPopover: false
		};
	},

	setPostButtonContext: function( component ) {
		this.setState( {
			postButtonContext: component
		} );
	},

	toggleSitesPopover: function( state ) {
		if ( undefined === state ) {
			state = ! this.state.isShowingPopover;
		}

		// Setting state in the context of a touchTap event (i.e. SitePicker
		// Site onSelect) prevents link navigation from proceeding
		setTimeout( this.setState.bind( this, {
			isShowingPopover: state
		} ), 0 );
	},

	onButtonClick: function( event ) {
		var visibleSiteCount = user.get().visible_site_count;

		// if multi-site and editor enabled, show site-selector
		if ( visibleSiteCount > 1 && config.isEnabled( 'post-editor' ) ) {
			this.toggleSitesPopover();
			event.preventDefault();
			return;
		}
	},

	preload: function() {
		if ( ! this._preloaded && config.isEnabled( 'post-editor' ) ) {
			this._preloaded = true;
			// preload the post editor chunk
			require.ensure( [ 'post-editor' ], function() {}, 'post-editor' );
		}
	},

	getPopoverPosition: function() {
		if ( viewport.isMobile() ) {
			return 'bottom';
		}

		if ( user.isRTL() ) {
			return 'bottom right';
		}

		return 'bottom left';
	},

	render: function() {
		var classes = classNames( 'masterbar-new-post', this.props.className ),
			linkTitle = this.translate( 'Create a New Post', { textOnly: true } ),
			currentSite = this.props.sites.getSelectedSite() || user.get().primarySiteSlug,
			postPath = paths.newPost( currentSite );

		return (
			<li className={ classes }>
				<a
					ref={ this.setPostButtonContext }
					rel={ ! config.isEnabled( 'post-editor' ) ? 'external' : null }
					onTouchStart={ this.preload }
					onMouseEnter={ this.preload }
					href={ postPath }
					onClick={ this.onButtonClick }
					title={ linkTitle }
					className="masterbar-new-post__button">
					<Gridicon icon="create" size={ 24 } />
					<span className="masterbar-new-post__label">{ this.translate( 'New Post' ) }</span>
				</a>
				<SitesPopover
					visible={ this.state.isShowingPopover }
					context={ this.state.postButtonContext }
					onClose={ this.toggleSitesPopover.bind( this, false ) }
					position={ this.getPopoverPosition() } />
			</li>
		);
	}
} );
