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

export default function ThemesFAQ() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onToggle = useCallback(
		( faqArgs: { id: string; isExpanded: boolean } ) => {
			const { id, isExpanded } = faqArgs;
			dispatch(
				recordTracksEvent( isExpanded ? 'calypso_themes_faq_open' : 'calypso_themes_faq_closed', {
					faq_id: id,
				} )
			);
		},
		[ dispatch ]
	);

	const faqItems: FAQItem[] = [
		{
			id: 'themes',
			question: translate( 'What are WordPress themes?' ),
			answer: translate(
				'Themes help structure your website’s design, ensuring consistency in layout, fonts, and colors—without needing to code. They provide a ready-to-go design, so you don’t need to start from scratch, while still allowing you to personalize it to suit your brand.'
			),
		},
		{
			id: 'premium-themes',
			question: translate( 'What are Premium WordPress themes?' ),
			answer: translate(
				'Premium themes are professionally designed themes available to paid plan customers. They often include advanced layouts, additional customization options, and unique design features not found in free themes.'
			),
		},
		{
			id: 'paid-themes',
			question: translate( 'Why do some WordPress themes cost money?' ),
			answer: translate(
				'Premium themes take more time and expertise to design, and often come with extra features or support from the theme creators. They’re included with WordPress.com paid plans, so you don’t need to purchase them separately.'
			),
		},
		{
			id: 'edit-themes',
			question: translate( 'Can I edit my theme?' ),
			answer: translate(
				'Yes. You can customize your theme with the Site Editor—changing colors, fonts, layouts, and even templates—while keeping your content intact. Some themes also include their own built-in customization options.'
			),
		},
		{
			id: 'change-theme-after-launch',
			question: translate( 'Can I change my WordPress theme after my site is launched?' ),
			answer: translate(
				'Absolutely. You can switch themes at any time. It won’t delete your content, but you may need to reconfigure some elements on the new design.'
			),
		},
		{
			id: 'third-party-themes',
			question: translate(
				'Can I install themes from third-party sources on my WordPress.com site?'
			),
			answer: translate(
				'Yes. On paid {{a}}WordPress.com{{/a}} plans, you can upload themes from other sources, including custom themes you’ve built.',
				{
					components: {
						a: <a href={ localizeUrl( 'https://wordpress.com' ) } />,
					},
				}
			),
		},
		{
			id: 'download-themes',
			question: translate( 'Can I download WordPress themes from WordPress.com?' ),
			answer: translate(
				'Only free themes can be downloaded from {{awpcom}}WordPress.com{{/awpcom}}. If you need more downloadable themes, check the {{awporg}}WordPress.org theme directory{{/awporg}}.',
				{
					components: {
						awpcom: <a href={ localizeUrl( 'https://wordpress.com' ) } />,
						awporg: <a href="https://wordpress.org/themes/" rel="noreferrer" target="_blank" />,
					},
				}
			),
		},
		{
			id: 'create-themes',
			question: translate( 'Can I create my own WordPress themes?' ),
			answer: translate(
				'Yes—if you’re on a paid plan, you can upload and use your own custom themes. Developers can also build themes locally and deploy them using tools like GitHub and WP-CLI. Check out {{a}}WordPress Studio{{/a}} for local theme development.',
				{
					components: {
						a: <a href="https://developer.wordpress.com/studio/" />,
					},
				}
			),
		},
		{
			id: 'themes-templates',
			question: translate( 'What is the difference between a theme and a template?' ),
			answer: translate(
				'A theme is the overall design framework for your site. Templates are individual layouts within a theme, such as a single post layout or a page template. Themes contain many templates.'
			),
		},
		{
			id: 'accessibility',
			question: translate( 'Is my theme accessible and mobile-friendly?' ),
			answer: translate(
				'Yes. All {{a}}WordPress.com{{/a}} themes are designed to be responsive (mobile-friendly) and meet accessibility best practices. You can preview how your site looks on different devices in the Site Editor.',
				{
					components: {
						a: <a href={ localizeUrl( 'https://wordpress.com' ) } />,
					},
				}
			),
		},
		{
			id: 'demos',
			question: translate( 'Why doesn’t my theme look the same as the demo after I install it?' ),
			answer: translate(
				'Demo sites often use sample content and images to show what’s possible. When you install a theme, your own content is applied — so it may look different until you customize it with your own pages, menus, and media.'
			),
		},
		{
			id: 'switch-themes',
			question: translate( 'How simple is it to switch themes?' ),
			answer: translate(
				'Switching is quick and takes just a few clicks in your dashboard. Your content won’t be lost, and you can preview a new theme before activating it.'
			),
		},
		{
			id: 'try-themes',
			question: translate( 'Can I try out a new theme without losing my content?' ),
			answer: translate(
				'Yes. You can preview themes in the Customizer or Site Editor before publishing changes. Your content stays safe, so you can experiment freely. Sites on the Business plan can test new themes on a staging site, which is a private copy of your public site for testing purposes.'
			),
		},
	];

	return (
		<div className="themes-faq">
			<div className="themes-faq__wrapper">
				<div className="themes-faq__header">
					<h2 className="themes-faq__title">{ translate( 'Themes FAQs' ) }</h2>
				</div>
				<div className="themes-faq__list">
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
		</div>
	);
}
