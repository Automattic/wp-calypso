/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' ),
	stats = require( 'reader/stats' ),
	SiteBlockActions = require( 'lib/reader-site-blocks/actions' ),
	Card = require( 'components/card' );

var PostBlocked = React.createClass( {

	mixins: [ PureRenderMixin ],

	unblock: function() {
		analytics.mc.bumpStat( 'reader_actions', 'unblocked_blog' );
		analytics.ga.recordEvent( 'reader_actions', 'Clicked Unblock Site' );
		stats.recordTrack( 'calypso_reader_unblock_site', {
			blog_id: this.props.post.site_ID,
		} );
		SiteBlockActions.unblock( this.props.post.site_ID );
	},

	render: function() {
		var post = this.props.post;

		return (
			<Card tagName="article" className="reader__card is-blocked">
				<p>{ this.translate( 'You have blocked posts from %(site_name)s.', { args: { site_name: post.site_name } } ) }
					<a onClick={ this.unblock }>{ this.translate( 'Undo' ) }?</a>
				</p>
			</Card>
		);
	}

} );

module.exports = PostBlocked;
