/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var ServiceExample = require( 'my-sites/sharing/connections/service-example' );

module.exports = React.createClass( {
	displayName: 'SharingServiceExamples',

	propTypes: {
		examples: React.PropTypes.object,
		site: React.PropTypes.object
	},

	getDefaultProps: function() {
		return {
			examples: Object.freeze( {
				facebook: function() {
					return [
						{
							image: {
								src: '/calypso/images/sharing/facebook-profile.png',
								alt: this.translate( 'Share posts to your Facebook page or profile', { textOnly: true } )
							},
							label: this.translate( '{{strong}}Connect{{/strong}} to automatically share posts on your Facebook page or profile.', {
								components: {
									strong: <strong />
								}
							} )
						},
						{
							image: {
								src: '/calypso/images/sharing/facebook-sharing.png',
								alt: this.translate( 'Add a sharing button', { textOnly: true } )
							},
							label: this.translate( 'Add a {{link}}sharing button{{/link}} to your posts so readers can share your story with their friends.', {
								components: {
									link: <a href={ this.props.site ? '/sharing/buttons/' + this.props.site.slug : 'https://support.wordpress.com/sharing/' } />
								}
							} )
						}
					];
				},
				instagram: function() {
					return [
						{
							image: {
								src: '/calypso/images/sharing/instagram-widget.png',
								alt: this.translate( 'Add an Instagram widget', { textOnly: true } )
							},
							label: this.translate( 'Add an {{link}}Instagram widget{{/link}} to display your latest photos.', {
								components: {
									link: <a href="https://support.wordpress.com/instagram/instagram-widget/" />
								}
							} )
						},
						{
							image: {
								src: '/calypso/images/sharing/instagram-media.png',
								alt: this.translate( 'Access Instagram photos via the Media Library', { textOnly: true } )
							},
							label: this.translate( 'Get instant access to all your Instagram photos through the {{link}}Media Library{{/link}}.', {
								components: {
									link: <a href="https://support.wordpress.com/media/" />
								}
							} )
						}
					];
				},
				twitter: function() {
					return [
						{
							image: {
								src: '/calypso/images/sharing/twitter-publicize.png',
								alt: this.translate( 'Share posts to your Twitter followers', { textOnly: true } )
							},
							label: this.translate( '{{strong}}Connect{{/strong}} to automatically share posts with your Twitter followers.', {
								components: {
									strong: <strong />
								}
							} )
						},
						{
							image: {
								src: '/calypso/images/sharing/twitter-timeline.png',
								alt: this.translate( 'Add a Twitter Timeline Widget', { textOnly: true } )
							},
							label: this.translate( 'Add a {{link}}Twitter Timeline Widget{{/link}} to display your latest tweets on your site.', {
								components: {
									link: <a href="https://support.wordpress.com/widgets/twitter-timeline-widget/" />
								}
							} )
						}
					];
				},
				google_plus: function() {
					return [
						{
							image: {
								src: '/calypso/images/sharing/google-publicize.png',
								alt: this.translate( 'Share posts to your Google+ page', { textOnly: true } )
							},
							label: this.translate( '{{strong}}Connect{{/strong}} to automatically share posts to your Google+ page.', {
								components: {
									strong: <strong />
								}
							} )
						},
						{
							image: {
								src: '/calypso/images/sharing/google-sharing.png',
								alt: this.translate( 'Add a sharing button', { textOnly: true } )
							},
							label: this.translate( 'Add a {{link}}sharing button{{/link}} to your posts so readers can share your story with their circles.', {
								components: {
									link: <a href={ this.props.site ? '/sharing/buttons/' + this.props.site.slug : 'https://support.wordpress.com/sharing/' } />
								}
							} )
						}
					];
				},
				linkedin: function() {
					return [
						{
							image: {
								src: '/calypso/images/sharing/linkedin-publicize.png',
								alt: this.translate( 'Share posts with your LinkedIn connections', { textOnly: true } )
							},
							label: this.translate( '{{strong}}Connect{{/strong}} to automatically share posts with your LinkedIn connections.', {
								components: {
									strong: <strong />
								}
							} )
						},
						{
							image: {
								src: '/calypso/images/sharing/linkedin-sharing.png',
								alt: this.translate( 'Add a sharing button', { textOnly: true } )
							},
							label: this.translate( 'Add a {{link}}sharing button{{/link}} to your posts so readers can share your story with their connections.', {
								components: {
									link: <a href={ this.props.site ? '/sharing/buttons/' + this.props.site.slug : 'https://support.wordpress.com/sharing/' } />
								}
							} )
						}
					];
				},
				tumblr: function() {
					return [
						{
							image: {
								src: '/calypso/images/sharing/tumblr-publicize.png',
								alt: this.translate( 'Share posts to your Tumblr blog', { textOnly: true } )
							},
							label: this.translate( '{{strong}}Connect{{/strong}} to automatically share posts to your Tumblr blog.', {
								components: {
									strong: <strong />
								}
							} )
						},
						{
							image: {
								src: '/calypso/images/sharing/tumblr-sharing.png',
								alt: this.translate( 'Add a sharing button', { textOnly: true } )
							},
							label: this.translate( 'Add a {{link}}sharing button{{/link}} to your posts so readers can share your story with their followers.', {
								components: {
									link: <a href={ this.props.site ? '/sharing/buttons/' + this.props.site.slug : 'https://support.wordpress.com/sharing/' } />
								}
							} )
						}
					];
				},
				path: function() {
					return [
						{
							image: {
								src: '/calypso/images/sharing/path-publicize.png',
								alt: this.translate( 'Share posts to your Path timeline', { textOnly: true } )
							},
							label: this.translate( '{{strong}}Connect{{/strong}} to automatically share posts to your Path timeline.', {
								components: {
									strong: <strong />
								}
							} )
						}
					];
				},
				eventbrite: function() {
					return [
						{
							image: {
								src: '/calypso/images/sharing/eventbrite-list.png',
								alt: this.translate( 'Connect Eventbrite to list your events', { textOnly: true } )
							},
							label: this.translate( '{{strong}}Connect{{/strong}} Eventbrite to {{link}}list all your events{{/link}} on a page.', {
								components: {
									strong: <strong />,
									link: <a href="https://support.wordpress.com/eventbrite" />
								}
							} )
						},
						{
							image: {
								src: '/calypso/images/sharing/eventbrite-widget.png',
								alt: this.translate( 'Add an Eventbrite widget to your page', { textOnly: true } )
							},
							label: this.translate( 'Add an {{link}}Eventbrite widget{{/link}} to display a list of your upcoming events.', {
								components: {
									link: <a href="https://support.wordpress.com/widgets/eventbrite-event-calendarlisting-widget/" />
								}
							} )
						}
					];
				},
				bandpage: function() {
					return [
						{
							image: {
								src: '/calypso/images/sharing/bandpage-widget.png',
								alt: this.translate( 'Add a BandPage widget', { textOnly: true } )
							},
							label: this.translate( 'Add a {{link}}BandPage widget{{/link}} to display your music, photos, videos bio, and event listings.', {
								components: {
									link: <a href="https://support.wordpress.com/widgets/bandpage-widget/" />
								}
							} )
						}
					];
				}
			} )
		};
	},

	getExamples: function() {
		var examples;

		if ( this.props.examples[ this.props.service.name ] ) {
			examples = this.props.examples[ this.props.service.name ].call( this );

			return examples.map( function( example, i ) {
				return <ServiceExample key={ i } image={ example.image } label={ example.label } single={ 1 === examples.length } />;
			} );
		}
	},

	render: function() {
		return <div className="sharing-service-examples">{ this.getExamples() }</div>;
	}
} );
