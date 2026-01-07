import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import FoldableFAQ from 'calypso/components/foldable-faq';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

interface FAQItem {
	id: string;
	question: string | React.ReactNode;
	answer: string | React.ReactNode;
}

export function PluginsFAQ() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onToggle = useCallback(
		( faqArgs: { id: string; isExpanded: boolean } ) => {
			const { id, isExpanded } = faqArgs;
			dispatch(
				recordTracksEvent( isExpanded ? 'calypso_plugins_faq_open' : 'calypso_plugins_faq_closed', {
					faq_id: id,
				} )
			);
		},
		[ dispatch ]
	);

	const faqItems: FAQItem[] = [
		{
			id: 'what-are-plugins',
			question: translate( 'What are WordPress plugins?' ),
			answer: translate(
				'Plugins are add-ons that extend your site’s functionality. From SEO and page builders to ecommerce and memberships, plugins let you add features or integrate your site with other services, all without writing custom code.'
			),
		},
		{
			id: 'pre-installed-plugins',
			question: translate( 'Does {{a}}WordPress.com{{/a}} come with any plugins pre-installed?', {
				components: {
					a: <a href={ localizeUrl( 'https://wordpress.com' ) } />,
				},
			} ),
			answer: translate(
				'A WordPress.com website has many more built-in features than a self-hosted WordPress site, meaning you won’t need a plugin for many common features. Before installing a plugin, check {{a}}this list{{/a}} to ensure the feature isn’t already available on your site.',
				{
					components: {
						a: (
							<a
								href={ localizeUrl(
									'https://wordpress.com/support/plugins/install-a-plugin/#before-installing-a-plugin'
								) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				}
			),
		},
		{
			id: 'can-install-plugins',
			question: translate( 'Can I install plugins on {{a}}WordPress.com{{/a}}?', {
				components: {
					a: <a href={ localizeUrl( 'https://wordpress.com' ) } />,
				},
			} ),
			answer: translate(
				'Yes. If you’re on a paid plan, you can install plugins from the directory or upload your own. Free plans include built-in features, but don’t support installing plugins.'
			),
		},
		{
			id: 'benefits-of-plugins',
			question: translate( 'What are the benefits of installing plugins on WordPress.com?' ),
			answer: translate(
				'Plugins give you the power to add any type of feature imaginable to your website. With over 60,000 plugins on WordPress, your website can do almost anything.{{br /}}{{br /}}With WordPress.com, plugins run on our rock-solid infrastructure. That means automatic updates, strong security protections, fast performance, and centralized billing — without extra setup on your part.',
				{
					components: {
						br: <br />,
					},
				}
			),
		},
		{
			id: 'plugins-security-risk',
			question: translate( 'Do plugins increase the risk of getting hacked?' ),
			answer: translate(
				'Not if you’re on WordPress.com. We automatically scan, update, and secure your environment to minimize risk. As with any software, it’s important to use reputable plugins and keep them updated.'
			),
		},
		{
			id: 'free-plugins',
			question: translate( 'Are there free plugins?' ),
			answer: translate(
				'Yes. Thousands of plugins in the directory are free to use. Many also offer paid upgrades for advanced features.'
			),
		},
		{
			id: 'paid-plugins',
			question: translate( 'Why do I need to pay for some plugins?' ),
			answer: translate(
				'Premium plugins often include more functionality, professional support, and ongoing development. The cost helps support the developers who maintain and improve the plugin over time. These plugins can be purchased directly from the developer. You can also purchase {{a}}some popular plugins{{/a}} conveniently from within your WordPress.com account.',
				{
					components: {
						a: <a href={ localizeUrl( 'https://wordpress.com/plugins/browse/paid/' ) } />,
					},
				}
			),
		},
		{
			id: 'make-own-plugins',
			question: translate( 'Can I make my own plugins?' ),
			answer: translate(
				'Yes. Developers can create custom plugins and upload them to WordPress.com on paid plans. You can also connect GitHub and use tools like WP-CLI for advanced workflows. Check out {{a}}WordPress Studio{{/a}} for local plugin development.',
				{
					components: {
						a: <a href="https://developer.wordpress.com/studio/" />,
					},
				}
			),
		},
		{
			id: 'popular-plugins',
			question: translate( 'What are the most popular plugins?' ),
			answer: translate(
				'Popular plugins include Yoast SEO, WooCommerce, Jetpack, and Elementor. They cover everything from search optimization to online stores.'
			),
		},
		{
			id: 'how-to-install',
			question: translate( 'How do I install plugins?' ),
			answer: translate(
				'On paid plans, go to your dashboard and click Plugins on the left-hand side. Browse or search the plugins directory, where you can learn about plugin features and see ratings. If you are happy with the plugin, click the “Install and activate” button to add it to your site. You can also upload a plugin ZIP file. For full instructions, see our {{a}}guide to installing plugins{{/a}}.',
				{
					components: {
						a: (
							<a
								href={ localizeUrl( 'https://wordpress.com/support/plugins/install-a-plugin/' ) }
							/>
						),
					},
				}
			),
		},
		{
			id: 'choose-useful-plugins',
			question: translate( 'How can I choose the most useful plugins for my site?' ),
			answer: translate(
				'Start with your goals. If you want more traffic, try an SEO plugin. If you need to sell products, add WooCommerce. Always check reviews, update history, and active installs to gauge reliability.'
			),
		},
		{
			id: 'plugins-and-plans',
			question: translate( 'Do plugins work with all {{a}}WordPress.com{{/a}} plans?', {
				components: {
					a: <a href={ localizeUrl( 'https://wordpress.com' ) } />,
				},
			} ),
			answer: translate(
				'Plugin installation is available on all paid plans. Free plans come with a curated set of built-in features instead of external plugins.'
			),
		},
		{
			id: 'performance-impact',
			question: translate( 'Will adding lots of plugins affect performance?' ),
			answer: translate(
				'Potentially, yes. Too many plugins — or poorly coded ones — can slow down your site. On WordPress.com, we optimize server resources, but it’s still best to install only the plugins you truly need.'
			),
		},
		{
			id: 'plugin-errors',
			question: translate( 'What should I do if a plugin causes errors or conflicts?' ),
			answer: translate(
				'You can deactivate the plugin from your dashboard, then reactivate plugins one by one to identify the cause. If you’re on a paid plan, our support team can help you troubleshoot.'
			),
		},
		{
			id: 'good-plugin-criteria',
			question: translate( 'What should I look for in a good plugin?' ),
			answer: translate(
				'Choose plugins with frequent updates, good documentation, and strong user ratings. A plugin with lots of active installs and recent support responses is generally more reliable.'
			),
		},
		{
			id: 'theme-compatibility',
			question: translate( 'How can I tell if a plugin will be compatible with my theme?' ),
			answer: translate(
				'Most plugins work with any theme. Still, it’s wise to preview changes in the Site Editor and check plugin documentation for any known conflicts.'
			),
		},
	];

	return (
		<div className="plugins-faq">
			<div className="plugins-faq__header">
				<h2 className="plugins-faq__title">{ translate( 'Plugins FAQs' ) }</h2>
			</div>
			<div className="plugins-faq__list">
				{ faqItems.map( ( item ) => (
					<FoldableFAQ
						key={ item.id }
						id={ item.id }
						question={ item.question }
						onToggle={ onToggle }
						icon="cross-small"
					>
						{ item.answer }
					</FoldableFAQ>
				) ) }
			</div>
		</div>
	);
}

export default PluginsFAQ;
