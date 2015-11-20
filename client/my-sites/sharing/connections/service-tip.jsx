/**
 * External dependencies
 */
var React = require( 'react' );

module.exports = React.createClass( {
	displayName: 'SharingServiceTip',

	getDefaultProps: function() {
		return {
			tips: Object.freeze( {
				facebook: function() {
					return this.translate( 'You can also add a {{likeBoxLink}}Like Box{{/likeBoxLink}}, a {{shareButtonLink}}share button{{/shareButtonLink}}, or {{embedLink}}embed{{/embedLink}} your page or profile on your site.', {
						components: {
							likeBoxLink: <a href="https://support.wordpress.com/facebook-integration/#facebook-like-box" />,
							shareButtonLink: <a href="https://support.wordpress.com/sharing/" />,
							embedLink: <a href="https://support.wordpress.com/facebook-integration/facebook-embeds/" />
						},
						context: 'Sharing: Tip in settings'
					} );
				},
				twitter: function() {
					return this.translate( 'You can also add a {{widgetLink}}Twitter Timeline Widget{{/widgetLink}} to display any public timeline on your site.', {
						components: {
							widgetLink: <a href="https://support.wordpress.com/widgets/twitter-timeline-widget/" />
						},
						context: 'Sharing: Tip in settings'
					} );
				},
				instagram: function() {
					return this.translate( 'You can also add an {{widgetLink}}Instagram Widget{{/widgetLink}} to display your latest Instagram photos on your site.', {
						components: {
							widgetLink: <a href="https://support.wordpress.com/instagram/instagram-widget/" />
						},
						context: 'Sharing: Tip in settings'
					} );
				},
				google_plus: function() {
					return this.translate( 'You can also {{embedLink}}embed a Google+ post{{/embedLink}} onto a post or page.', {
						components: {
							embedLink: <a href="https://support.wordpress.com/google-plus-embeds/" />
						},
						context: 'Sharing: Tip in settings'
					} );
				},
				eventbrite: function() {
					return this.translate( 'You can also add the {{embedLink}}Eventbrite widget{{/embedLink}} to display events in a sidebar.', {
						components: {
							embedLink: <a href="https://support.wordpress.com/widgets/eventbrite-event-calendarlisting-widget/" />
						},
						context: 'Sharing: Tip in settings'
					} );
				}
			} )
		};
	},

	render: function() {
		if ( 'function' === typeof this.props.tips[ this.props.service.name ] ) {
			return (
				<div className="sharing-service-tip">
					<span className="noticon noticon-info"></span>{ this.props.tips[ this.props.service.name ].call( this ) }
				</div>
			);
		} else {
			return <div className="sharing-service-tip" />;
		}
	}
} );
