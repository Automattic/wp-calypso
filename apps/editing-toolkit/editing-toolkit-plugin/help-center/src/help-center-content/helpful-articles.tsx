import {
	helpDomains,
	helpGetStarted,
	helpPlugins,
	helpPrivacy,
	helpWebsite,
	helpPurchases,
	HelpResult,
} from '@automattic/help-center';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';

const HelpfulArticles = () => {
	console.log( 'HelpfulArticles' );
	const { __ } = useI18n();

	const helpfulResults = [
		{
			link: 'https://wordpress.com/support/do-i-need-a-website-a-blog-or-a-website-with-a-blog/',
			title: __( 'Do I Need a Website, a Blog, or a Website with a Blog?', 'full-site-editing' ),
			description: __(
				'If you’re building a brand new site, you might be wondering if you need a website, a blog, or a website with a blog. At WordPress.com, you can create all of these options easily, right in your dashboard.',
				'full-site-editing'
			),
			image: helpWebsite,
		},
		{
			link: 'https://wordpress.com/support/business-plan/',
			title: __( 'Uploading custom plugins and themes', 'full-site-editing' ),
			description: __(
				'Learn more about installing a custom theme or plugin using the Business plan.',
				'full-site-editing'
			),
			image: helpPlugins,
		},
		{
			link: 'https://wordpress.com/support/domains/',
			title: __( 'All About Domains', 'full-site-editing' ),
			description: __(
				'Set up your domain whether it’s registered with WordPress.com or elsewhere.',
				'full-site-editing'
			),
			image: helpDomains,
		},
		{
			link: 'https://wordpress.com/support/start/',
			title: __( 'Get Started', 'full-site-editing' ),
			description: __(
				'No matter what kind of site you want to build, our five-step checklists will get you set up and ready to publish.',
				'full-site-editing'
			),
			image: helpGetStarted,
		},
		{
			link: 'https://wordpress.com/support/settings/privacy-settings/',
			title: __( 'Privacy Settings', 'full-site-editing' ),
			description: __(
				'Limit your site’s visibility or make it completely private.',
				'full-site-editing'
			),
			image: helpPrivacy,
		},
		{
			link: 'https://wordpress.com/support/manage-purchases/',
			title: __( 'Managing Purchases, Renewals, and Cancellations', 'full-site-editing' ),
			description: __(
				'Have a question or need to change something about a purchase you have made? Learn how.',
				'full-site-editing'
			),
			image: helpPurchases,
		},
	];

	return (
		<>
			<h2 className="help__section-title">
				{ __( 'Recommended resources', 'full-site-editing' ) }
			</h2>
			<div className="help-results">
				{ helpfulResults.map( ( result, index ) => {
					// const trackClick = () => {
					// 	debug( 'Suggested result click: ', result.link );
					// 	recordTracksEvent( 'calypso_help_suggested_result_click', {
					// 		link: result.link,
					// 		position: index,
					// 	} );
					// };

					return (
						<HelpResult
							key={ result.link }
							helpLink={ result }
							iconTypeDescription="book"
							// onClick={ trackClick }
							localizedReadArticle={ __( 'Read article', 'full-site-editing' ) }
						/>
					);
				} ) }
			</div>
		</>
	);
};

export default HelpfulArticles;
