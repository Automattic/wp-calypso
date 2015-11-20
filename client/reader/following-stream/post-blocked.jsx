// External dependencies
var React = require( 'react/addons' );

// Internal dependencies
var analytics = require( 'analytics' ),
	SiteBlockActions = require( 'lib/reader-site-blocks/actions' ),
	Card = require( 'components/card' );

var PostBlocked = React.createClass( {

	mixins: [ React.addons.PureRenderMixin ],

	unblock: function() {
		analytics.mc.bumpStat( 'reader_actions', 'unblocked_blog' );
		analytics.ga.recordEvent( 'reader_actions', 'Clicked Unblock Site' );
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
