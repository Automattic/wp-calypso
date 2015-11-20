var React = require( 'react/addons' ),
	config = require( 'config' );

var Card = require( 'components/card' );

var PostUnavailable = React.createClass( {

	mixins: [ React.addons.PureRenderMixin ],

	componentWillMount: function() {
		this.errors = {
			403: this.translate( 'This is a private site. You’re following the site, but not currently a member. Please request membership to display these posts in Reader.' ),
			default: this.translate( 'An error occurred loading this post' )
		};
	},

	render: function() {
		var errorMessage = this.errors[ this.props.post.statusCode || 'default' ];

		if ( this.props.post.statusCode === 404 ) {
			// don't render a card for 404s. These are posts that we once had but were deleted.
			return null;
		}

		return (
			<Card tagName="article" className="reader__card is-error">
				<div className="reader__post-header">
					<h1 className="reader__post-title"><a className="reader__post-title-link" target="_blank"><span className="reader__placeholder-text">Oops!</span></a></h1>
				</div>

				<div className="reader__post-excerpt">
					<p>{ errorMessage }</p>
					{ config.isEnabled( 'reader/full-errors' ) ? <pre>{ JSON.stringify( this.props.post, null, '  ' ) }</pre> : null }
					</div>
			</Card>
		);
	}

} );

module.exports = PostUnavailable;
