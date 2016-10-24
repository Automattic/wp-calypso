/**
 * External dependencies
 */
var React = require( 'react' ),
	i18n = require( 'i18n-calypso' );

/**
 * Internal dependencies
 */
var paths = require( 'lib/paths' ),
	config = require( 'config' );

function buildCustomizeButtonURL( site ) {
	if ( site ) {
		return site.jetpack ? site.options.admin_url + 'customize.php' : '/customize/' + site.slug;
	}
	return '/customize/';
}

module.exports = {

	// You can define which steps, and in which order, they should appear.
	defaultSequence: [ 'customize', 'theme', 'plans', 'post', 'page' ],

	hasPlanSequence: [ 'customize', 'theme', 'post', 'page', 'follow' ],

	userOnly: [ 'site', 'profile', 'follow' ],

	// Here you can add new steps
	definitions: function( site ) {
		return {
			post: {
				title: i18n.translate( 'Start Your First Post' ),
				body: i18n.translate( '{{p1}}Start blogging right away by writing your first post.{{/p1}}{{p2}}You can create new posts by clicking the {{pencil}}{{/pencil}} at the top of the screen.{{/p2}}', {
					comment: 'p1 and p2 are paragraph tags.',
					components: {
						p1: <p />,
						p2: <p />,
						pencil: <span className="noticon noticon-edit" />,
					}
				} ),
				buttonText: i18n.translate( 'Start a Post' ),
				buttonURL: paths.newPost( site )
			},

			theme: {
				title: i18n.translate( 'Select a Theme' ),
				body: i18n.translate( '{{p1}}The theme is the look and feel of your WordPress. A theme doesn\'t change your content, just the way it is presented.{{/p1}}{{p2}}Choose a theme based on your taste. You can always change it later.{{/p2}}', {
					comment: 'p1 and p2 are paragraph tags.',
					components: {
						p1: <p />,
						p2: <p />
					}
				} ),
				buttonText: i18n.translate( 'Select a Theme' ),
				buttonURL: '/design/' + ( site ? site.slug : '' )
			},

			customize: {
				title: i18n.translate( 'Customize Your Site' ),
				body: i18n.translate( '{{p1}}You can use the Customizer to add header and background images, or tweak your theme.  {{/p1}}{{p2}}You can find the Customizer in My Sites.{{/p2}}', {
					comment: 'p1 and p2 are paragraph tags.',
					components: {
						p1: <p />,
						p2: <p />,
					}
				} ),
				buttonText: i18n.translate( 'Customize Your Site' ),
				buttonURL: buildCustomizeButtonURL( site )
			},

			plans: {
				title: i18n.translate( 'Add Features with a Plan' ),
				body: i18n.translate( '{{p1}}Plans upgrade your WordPress with storage, design options, and a custom domain.{{/p1}}{{p2}}A plan will also remove ads and enable audio and video uploads.{{/p2}}', {
					comment: 'p1 and p2 are paragraph tags',
					components: {
						p1: <p />,
						p2: <p />,
					}
				} ),
				buttonText: i18n.translate( 'Add a Plan' ),
				buttonURL: '/plans/' + ( site ? site.slug : '' )
			},
			page: {
				title: i18n.translate( 'Create a Page' ),
				body: i18n.translate( '{{p1}}Pages are sections of your site that contain information for your visitors.{{/p1}}{{p2}}Think about creating an About or Contact Us page to get started.{{/p2}}', {
					comment: 'p1 and p2 are paragraph tags.',
					components: {
						p1: <p />,
						p2: <p />,
					}
				} ),
				buttonText: i18n.translate( 'Create a Page' ),
				buttonURL: paths.newPage( site )
			},
			site: {
				title: i18n.translate( 'Create a Site' ),
				body: i18n.translate( '{{p1}}Start a new WordPress site or blog.{{/p1}}{{p2}}Your own WordPress is free and a great way to create a home on the web.{{/p2}}', {
					comment: 'p1 and p2 are paragraph tags.',
					components: {
						p1: <p />,
						p2: <p />,
					}
				} ),
				buttonText: i18n.translate( 'Create a Site' ),
				buttonURL: config( 'signup_url' )
			},
			profile: {
				title: i18n.translate( 'Complete Your Profile' ),
				body: i18n.translate( '{{p1}}Your profile is how other users see you.{{/p1}}{{p2}}Share a blurb about yourself to let others know what you\'re all about.{{/p2}}', {
					comment: 'p1 and p2 are paragraph tags.',
					components: {
						p1: <p />,
						p2: <p />,
					}
				} ),
				buttonText: i18n.translate( 'Complete Your Profile' ),
				buttonURL: '/me'
			},
			follow: {
				title: i18n.translate( 'Follow Some Blogs' ),
				body: i18n.translate( '{{p1}}Follow some other sites to stay informed and find inspiration.{{/p1}}{{p2}}All of the content you follow shows up in your Reader.{{/p2}}', {
					comment: 'p1 and p2 are paragraph tags.',
					components: {
						p1: <p />,
						p2: <p />,
					}
				} ),
				buttonText: i18n.translate( 'Follow Some Blogs' ),
				buttonURL: '/recommendations/'
			}
		};
	}
};
