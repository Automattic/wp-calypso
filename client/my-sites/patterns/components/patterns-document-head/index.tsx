import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import type { Category } from 'calypso/my-sites/patterns/types';

export const PatternsDocumentHead = ( { category }: { category: Category[ 'name' ] } ) => {
	const translate = useTranslate();

	const PATTERN_SEO_CONTENT: Record< Category[ 'name' ], { title: string } > = {
		default: {
			title: translate( 'WordPress Patterns', {
				comment: 'Pattern Library home page title',
				textOnly: true,
			} ),
		},
		header: {
			title: translate( 'WordPress Header Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} ),
		},
		footer: {
			title: translate( 'WordPress Footer Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} ),
		},
		about: {
			title: translate( 'WordPress About Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} ),
		},
		posts: {
			title: translate( 'WordPress Blog Post Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} ),
		},
		contact: {
			title: translate( 'WordPress Contact Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} ),
		},
		events: {
			title: translate( 'WordPress Events Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} ),
		},
		gallery: {
			title: translate( 'WordPress Gallery Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} ),
		},
		intro: {
			title: translate( 'WordPress Intro Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} ),
		},
		menu: {
			title: translate( 'WordPress Menu Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} ),
		},
		newsletter: {
			title: translate( 'WordPress Newsletter Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} ),
		},
		services: {
			title: translate( 'WordPress Services Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} ),
		},
		store: {
			title: translate( 'WordPress Store Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} ),
		},
		testimonials: {
			title: translate( 'WordPress Testimonial Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} ),
		},
	};

	const seoContent = category ? PATTERN_SEO_CONTENT[ category ] : PATTERN_SEO_CONTENT.default;

	return <DocumentHead title={ seoContent.title } />;
};
