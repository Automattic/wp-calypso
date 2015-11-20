/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var PublicizeOptions = require( './publicize-options' ),
	SharingLikeOptions = require( './sharing-like-options' ),
	postUtils = require( 'lib/posts/utils' );

module.exports = React.createClass( {
	displayName: 'EditorSharing',

	propTypes: {
		site: React.PropTypes.object,
		post: React.PropTypes.object,
		isNew: React.PropTypes.bool,
		connections: React.PropTypes.array,
		fetchConnections: React.PropTypes.func
	},

	isSharingButtonsEnabled() {
		if ( ! this.props.site || ! this.props.site.jetpack ) {
			return true;
		}

		if ( ! this.props.site.isModuleActive( 'sharedaddy' ) ) {
			return false;
		}

		return true;
	},

	isLikesEnabled() {
		if ( ! this.props.site || ! this.props.site.jetpack ) {
			return true;
		}

		if ( ! this.props.site.isModuleActive( 'likes' ) ) {
			return false;
		}

		return true;
	},

	renderSharingLikeOptions() {
		if ( ! this.isSharingButtonsEnabled() && ! this.isLikesEnabled() ) {
			return null;
		}

		return(
			<SharingLikeOptions
				post={ this.props.post }
				site={ this.props.site }
				isSharingButtonsEnabled={ this.isSharingButtonsEnabled() }
				isLikesEnabled={ this.isLikesEnabled() }
				isNew={ this.props.isNew } />
		);
	},

	renderPublicizeOptions() {
		if ( postUtils.isPage( this.props.post ) ) {
			return;
		}

		return (
			<PublicizeOptions
				post={ this.props.post }
				site={ this.props.site }
				connections={ this.props.connections }
				fetchConnections={ this.props.fetchConnections } />
		);
	},

	render: function() {
		return (
			<div className="editor-sharing">
				{ this.renderPublicizeOptions() }
				{ this.renderSharingLikeOptions() }
			</div>
		);
	}
} );
