import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	HOME_PAGE,
	BLOG_PAGE,
	CONTACT_PAGE,
	ABOUT_PAGE,
	PHOTO_GALLERY_PAGE,
	VIDEO_GALLERY_PAGE,
	PODCAST_PAGE,
	PORTFOLIO_PAGE,
	FAQ_PAGE,
	SITEMAP_PAGE,
	PROFILE_PAGE,
	MENU_PAGE,
	SERVICES_PAGE,
	TESTIMONIALS_PAGE,
	PRICING_PAGE,
	TEAM_PAGE,
} from 'calypso/signup/difm/constants';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Provides the universal translated set of page titles available for DIFM
 *
 * @returns
 */
export function useTranslatedPageTitles() {
	const translate = useTranslate();
	const pages: Record< string, TranslateResult > = useMemo(
		() => ( {
			[ HOME_PAGE ]: translate( 'Home' ),
			[ BLOG_PAGE ]: translate( 'Blog' ),
			[ CONTACT_PAGE ]: translate( 'Contact' ),
			[ ABOUT_PAGE ]: translate( 'About' ),
			[ PHOTO_GALLERY_PAGE ]: translate( 'Photo Gallery' ),
			[ VIDEO_GALLERY_PAGE ]: translate( 'Video Gallery' ),
			[ PODCAST_PAGE ]: translate( 'Podcast' ),
			[ PORTFOLIO_PAGE ]: translate( 'Portfolio' ),
			[ FAQ_PAGE ]: translate( 'FAQ' ),
			[ SITEMAP_PAGE ]: translate( 'Sitemap' ),
			[ PROFILE_PAGE ]: translate( 'Profile' ),
			[ MENU_PAGE ]: translate( 'Menu' ),
			[ SERVICES_PAGE ]: translate( 'Services' ),
			[ TESTIMONIALS_PAGE ]: translate( 'Testimonials' ),
			[ PRICING_PAGE ]: translate( 'Pricing' ),
			[ TEAM_PAGE ]: translate( 'Team' ),
		} ),
		[ translate ]
	);
	return pages;
}

export function useTranslatedPageDescriptions() {
	const translate = useTranslate();
	const descriptions: Record< string, TranslateResult > = useMemo(
		() => ( {
			[ HOME_PAGE ]: translate(
				'An overview of you, your writing, or your business. What phrases would someone search on Google to find you? What can visitors expect on this site?'
			),
			[ ABOUT_PAGE ]: translate(
				'Provide background information about you or the business. Why did you start this website? What is your personal story?'
			),
			[ CONTACT_PAGE ]: translate(
				'Visitors want to get in touch with you. How can they reach you?'
			),
			[ BLOG_PAGE ]: translate(
				'How would you introduce your journal entries/news articles/chapters? Describe what readers can expect from your regularly published content!'
			),
			[ PHOTO_GALLERY_PAGE ]: translate(
				'A visual space to share pictures with your website visitors. Add a text summary to describe the gallery to your visitors.'
			),
			[ SERVICES_PAGE ]: translate(
				'Describe what services you offer to the website visitor. Imagine if the visitor is unfamiliar with your field of expertise: how would you explain what you offer?'
			),
			[ VIDEO_GALLERY_PAGE ]: translate(
				'A perfect place to showcase videos of you or your business. Add a text summary to describe the gallery to your visitors.'
			),
			[ PRICING_PAGE ]: translate(
				"What's for sale? This can be food on the menu, hair styling costs, books, services, consulting, etc. You can list the prices of anything you're selling!"
			),
			[ PORTFOLIO_PAGE ]: translate(
				'A space to showcase your work. What is the common theme with your work? What do you do best?'
			),
			[ FAQ_PAGE ]: translate(
				'Do customers/readers tend to ask similar questions? List the most common questions with the answers to help people find information.'
			),
			[ TESTIMONIALS_PAGE ]: translate(
				'Use this page to build credibility. Share reviews or quotes about you and/or your business.'
			),
			[ TEAM_PAGE ]: translate(
				'Showcase a mini profile of each member of your business, with an image, name, and role description.'
			),
		} ),
		[ translate ]
	);
	return descriptions;
}
