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
			id: 'what-is-theme',
			question: translate( 'What is a WordPress theme?' ),
			answer: translate(
				'A WordPress theme controls the design and layout of your website. It determines how your site looks to visitors, including colors, typography, page templates, and overall structure.'
			),
		},
		{
			id: 'change-theme',
			question: translate( 'Can I change my theme later?' ),
			answer: translate(
				'Yes, you can switch themes at any time. Your content is preserved when you change themes, though you may need to adjust some settings to match the new design.'
			),
		},
		{
			id: 'customize-theme',
			question: translate( 'Can I customize my theme?' ),
			answer: translate(
				'Absolutely. Most themes let you customize colors, fonts, layouts, and more through the Site Editor. You can make your site look unique without writing any code.'
			),
		},
		{
			id: 'free-vs-premium',
			question: translate( 'What is the difference between free and premium themes?' ),
			answer: translate(
				'Free themes offer a solid foundation for your site. Premium themes typically include more advanced design options, additional templates, and dedicated support from the theme developer.'
			),
		},
		{
			id: 'theme-performance',
			question: translate( 'Do themes affect site performance?' ),
			answer: translate(
				'Themes can impact loading speed and performance. All themes on WordPress.com are reviewed for quality, but simpler themes with fewer features generally load faster.'
			),
		},
		{
			id: 'theme-mobile',
			question: translate( 'Are themes mobile-friendly?' ),
			answer: translate(
				'Yes. All themes on WordPress.com are responsive and designed to look great on desktops, tablets, and mobile devices.'
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
