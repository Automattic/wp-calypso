import { translate } from 'i18n-calypso';

const translations = [
	// Paid theme
	translate( 'Unveil the wow factor' ),
	translate(
		`All set! Activate the %(themeName)s theme and take your site's style to the next level.`,
		{
			args: {
				themeName: 'Livro',
			},
		}
	),
	translate( '%(themeName)s theme', {
		args: {
			themeName: 'Livro',
		},
	} ),
	translate( 'Available until %(date)s', {
		args: {
			savingsValue: 'June 30, 2022',
		},
	} ),
	translate( 'Activate theme' ),
	translate( 'Need help setting up your theme?' ),
	translate(
		'Check out our support documentation for step-by-step instructions and expert guidance on your theme set up.'
	),
	translate( '{{a}}Get set up support{{/a}}', {
		components: {
			a: <a href=" https://wordpress.com/support/themes/set-up-your-theme/" />,
		},
	} ),
	translate( 'Your go-to theme resource' ),
	translate(
		'Take a look at our comprehensive support documentation and learn more about themes.'
	),
	translate( '{{a}}Learn more about themes{{/a}}', {
		components: {
			a: <a href="https://wordpress.com/support/themes/" />,
		},
	} ),

	// Free theme
	translate( 'Way to make an impression' ),
	translate( 'Your site looks stunning with its new theme. Take a look or start styling it up.' ),
	translate( 'Customize the theme' ),
	translate( 'Visit site' ),
	translate( 'Solve anything with your go-to theme resource' ),
	translate(
		'Take a look at our comprehensive support documentation and learn more about themes.'
	),

	// Paid single plugin
	translate( 'Your site, more powerful than ever' ),
	translate( 'Use the plugin' ),
	translate( 'Manage plugin' ),
	translate( 'Need help setting your plugin up?' ),
	translate(
		'Check out our support documentation for step-by-step instructions and expert guidance on your plugin set up.'
	),
	translate( '{{a}}Plugin setup guide{{/a}}', {
		components: {
			a: <a href="https://wordpress.com/support/plugins/use-your-plugins/" />,
		},
	} ),
	translate( 'All-in-one plugin documentation' ),
	translate( `Unlock your plugin's potential with our comprehensive support documentation.` ),
	translate( 'Plugin documentation' ),

	// Paid multiple plugin
	translate(
		'All set! Time to put your new plugin to work and take your site further.',
		'All set! Time to put your new plugins to work and take your site further.',
		{
			count: 2,
		}
	),
	translate( 'Use the plugins' ),
	translate( 'Plugin guide' ),

	// Plan / Annual / Without custom domain selected or included in the cart
	translate( 'Get the best out of your site' ),
	translate( 'All set! Start exploring the features included with your %(plan)s plan', {
		args: {
			plan: translate( 'Free' ),
		},
	} ),
	translate( '%(plan)s plan', {
		args: {
			plan: translate( 'Free' ),
		},
		comment: `Shows which plan the user is on. For example, "Free plan"`,
	} ),
	translate( `Let’s work on the site` ),
	translate( 'Manage plan' ),
	translate( 'Claim your free domain ' ),
	translate(
		'Easy to remember. Easy to share. And free for your first year. Help people find you with a personalized site address.'
	),
	translate( '{{a}}Claim custom domain{{/a}}', {
		components: {
			a: <a href="https://wordpress.com/domains/add/" />,
		},
	} ),
	translate( 'Everything you need to know' ),
	translate( 'Explore our support guides and find an answer to every question.' ),
	translate( '{{a}}Explore support resources{{/a}}', {
		components: {
			a: <a href="https://wordpress.com/support/" />,
		},
	} ),

	// Plan monthly or annual with custom domain for Business plans and above
	translate( 'There’s a plugin for that' ),
	translate(
		'With 54,000+ plugins and apps, you’ll never outgrow your website. If you can think of it, there’s a plugin to make it happen.'
	),
	translate( '{{a}}Discover plugins{{/a}}', {
		components: {
			a: <a href="https://wordpress.com/plugins/" />,
		},
	} ),

	// Plan monthly or annual with custom domain for plans below Business
	translate( 'A site refresh' ),
	translate(
		'A new look and feel can help you stand out from the crowd. Get a new theme and make an impression.'
	),
	translate( '{{a}}Find your new theme{{/a}}', {
		components: {
			a: <a href="https://wordpress.com/themes/" />,
		},
	} ),

	// Domains
	translate( 'Your own corner of the web' ),
	translate(
		'All set! We’re just setting up your new domain so you can start spreading the word.'
	),
	translate( 'Share site' ),
	translate( 'Site copied' ),
	translate( 'Dive into domain essentials' ),
	translate(
		'Check out our support documentation for step-by-step instructions and expert guidance on your domain set up.'
	),
	translate( '{{a}}Master the domain basics{{/a}}', {
		components: {
			a: <a href="https://wordpress.com/support/domains/" />,
		},
	} ),
	translate( 'Your go-to domain resource' ),
	translate(
		'Dive into our comprehensive support documentation to learn the basics of domains, from registration to management.'
	),
	translate( '{{a}}Domain support resources{{/a}}', {
		components: {
			a: <a href="https://wordpress.com/support/category/domains-and-email/" />,
		},
	} ),

	// Email (titan)
	translate( 'Say hello to your new email address' ),
	translate( 'All set! Now it’s time to update your contact details.' ),
	translate( 'Go to inbox' ),
	translate( 'Manage email' ),
	translate( 'Manage your email and site from anywhere' ),
	translate(
		'The Jetpack mobile app for iOS and Android makes managing your email, domain, and website even simpler.'
	),
	translate( 'Get the app' ),
	translate( 'Email questions? We have the answers' ),
	translate(
		'Explore our comprehensive support guides and find solutions to all your email-related questions.'
	),
	translate( '{{a}}Email support resources{{/a}}', {
		components: {
			a: <a href="https://wordpress.com/support/category/domains-and-email/email/" />,
		},
	} ),

	// Generic
	translate( 'Great choices!' ),
	translate( 'All set! Ready to take your site even further?' ),
];

const CongratsTranslations = () => (
	<>
		{ translations.map( ( string ) => (
			<div>{ string }</div>
		) ) }
	</>
);

export const testCongratsTranslations = ( context, next ) => {
	context.primary = <CongratsTranslations />;
	next();
};
