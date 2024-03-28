import { I18N } from 'i18n-calypso';

type Key =
	| 'default_page_title'
	| 'header_page_title'
	| 'footer_page_title'
	| 'about_page_title'
	| 'posts_page_title'
	| 'contact_page_title'
	| 'events_page_title'
	| 'gallery_page_title'
	| 'intro_page_title'
	| 'menu_page_title'
	| 'newsletter_page_title'
	| 'services_page_title'
	| 'store_page_title'
	| 'testimonials_page_title'
	| 'fredrik_test';

export function getTranslatedString( translate: I18N[ 'translate' ], key: Key ): string {
	switch ( key ) {
		case 'default_page_title':
			return translate( 'WordPress Patterns', {
				comment: 'Pattern Library home page title',
				textOnly: true,
			} );

		case 'header_page_title':
			return translate( 'WordPress Header Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} );

		case 'footer_page_title':
			return translate( 'WordPress Footer Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} );

		case 'about_page_title':
			return translate( 'WordPress About Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} );

		case 'posts_page_title':
			return translate( 'WordPress Blog Post Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} );

		case 'contact_page_title':
			translate( 'WordPress Contact Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} );

		case 'events_page_title':
			return translate( 'WordPress Events Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} );

		case 'gallery_page_title':
			return translate( 'WordPress Gallery Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} );

		case 'intro_page_title':
			return translate( 'WordPress Intro Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} );

		case 'menu_page_title':
			return translate( 'WordPress Menu Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} );

		case 'newsletter_page_title':
			return translate( 'WordPress Newsletter Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} );

		case 'services_page_title':
			return translate( 'WordPress Services Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} );

		case 'store_page_title':
			return translate( 'WordPress Store Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} );

		case 'testimonials_page_title':
			return translate( 'WordPress Testimonial Patterns', {
				comment: 'Pattern Library category page title',
				textOnly: true,
			} );

		case 'fredrik_test':
			return translate( 'Fredrik Lorem Ipsum Hello', {
				comment: 'Test string',
				textOnly: true,
			} );
	}
}
