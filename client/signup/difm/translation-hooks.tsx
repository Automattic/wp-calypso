import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	HOME_PAGE,
	BLOG_PAGE,
	CONTACT_PAGE,
	ABOUT_PAGE,
	PHOTO_GALLERY_PAGE,
	VIDEO_GALLERY_PAGE,
	PORTFOLIO_PAGE,
	FAQ_PAGE,
	SERVICES_PAGE,
	TESTIMONIALS_PAGE,
	PRICING_PAGE,
	TEAM_PAGE,
	SHOP_PAGE,
	CUSTOM_PAGE,
	CAREERS_PAGE,
	CASE_STUDIES_PAGE,
	DONATE_PAGE,
	EVENTS_PAGE,
	NEWSLETTER_PAGE,
} from 'calypso/signup/difm/constants';
import type { PageId } from 'calypso/signup/difm/constants';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Provides the universal translated set of page titles available for DIFM
 * @returns
 */
export function useTranslatedPageTitles() {
	const translate = useTranslate();
	return useMemo( () => {
		const pages: Record< PageId, TranslateResult > = {
			[ HOME_PAGE ]: translate( 'Home' ),
			[ BLOG_PAGE ]: translate( 'Blog' ),
			[ CONTACT_PAGE ]: translate( 'Contact' ),
			[ ABOUT_PAGE ]: translate( 'About' ),
			[ PHOTO_GALLERY_PAGE ]: translate( 'Photo Gallery' ),
			[ VIDEO_GALLERY_PAGE ]: translate( 'Video Gallery' ),
			[ PORTFOLIO_PAGE ]: translate( 'Portfolio' ),
			[ FAQ_PAGE ]: translate( 'FAQ' ),
			[ SERVICES_PAGE ]: translate( 'Services' ),
			[ TESTIMONIALS_PAGE ]: translate( 'Testimonials' ),
			[ PRICING_PAGE ]: translate( 'Pricing' ),
			[ TEAM_PAGE ]: translate( 'Team' ),
			[ SHOP_PAGE ]: translate( 'Shop' ),
			[ CUSTOM_PAGE ]: translate( 'Custom Page' ),
			[ CAREERS_PAGE ]: translate( 'Careers' ),
			[ EVENTS_PAGE ]: translate( 'Events' ),
			[ DONATE_PAGE ]: translate( 'Donate' ),
			[ NEWSLETTER_PAGE ]: translate( 'Newsletter' ),
			[ CASE_STUDIES_PAGE ]: translate( 'Case Studies' ),
		};
		return pages;
	}, [ translate ] );
}

// Requesting Contexts
export const BBE_ONBOARDING_PAGE_PICKER_STEP = 'BBE_ONBOARDING_PAGE_PICKER_STEP';
export const BBE_STORE_ONBOARDING_PAGE_PICKER_STEP = 'BBE_STORE_ONBOARDING_PAGE_PICKER_STEP';
export const BBE_WEBSITE_CONTENT_FILLING_STEP = 'BBE_WEBSITE_CONTENT_FILLING_STEP';
export const BBE_STORE_WEBSITE_CONTENT_FILLING_STEP = 'BBE_STORE_WEBSITE_CONTENT_FILLING_STEP';
export type BBETranslationContext =
	| typeof BBE_ONBOARDING_PAGE_PICKER_STEP
	| typeof BBE_STORE_ONBOARDING_PAGE_PICKER_STEP
	| typeof BBE_WEBSITE_CONTENT_FILLING_STEP
	| typeof BBE_STORE_WEBSITE_CONTENT_FILLING_STEP;

export function useTranslatedPageDescriptions(
	pageId: PageId,
	context?: BBETranslationContext
): TranslateResult {
	const translate = useTranslate();
	const defaultDescriptions: Record< PageId, TranslateResult > = {
		[ HOME_PAGE ]: translate(
			'Introduce your business, writing, or yourself. Highlight what visitors can expect on your site.'
		),
		[ ABOUT_PAGE ]: translate(
			'Share your story or business background. Explain why you created this website.'
		),
		[ CONTACT_PAGE ]: translate(
			'Provide ways for visitors to contact you. Highlight your preferred contact methods: telephone, email, etc'
		),
		[ BLOG_PAGE ]: translate(
			"Share news, journal entries, or recipes! We'll set up three posts to get you started."
		),

		[ PHOTO_GALLERY_PAGE ]: translate(
			'Showcase creative work or memories. Perfect for photographers, artists, or for visual storytelling.'
		),
		[ SERVICES_PAGE ]: translate(
			'Describe your skills and services to potential clients, highlighting what sets you apart.'
		),
		[ VIDEO_GALLERY_PAGE ]: translate(
			'Show videos of your work or business. Include a description to guide your visitors.'
		),
		[ PRICING_PAGE ]: translate(
			'List what you sell: food, services, books, etc. Highlight pricing details.'
		),
		[ PORTFOLIO_PAGE ]: translate(
			'Display your completed projects, photos, artwork, or articles. Let your work shine.'
		),
		[ FAQ_PAGE ]: translate(
			'Answer common questions from customers or readers. Offer quick information access.'
		),
		[ TESTIMONIALS_PAGE ]: translate(
			'Build trust with reviews or quotes about your work or business. Share success stories.'
		),
		[ TEAM_PAGE ]: translate(
			'Profile your team members with pictures, names, and roles or job titles. Introduce the people behind your business.'
		),
		[ SHOP_PAGE ]: translate(
			'Your shop page will display all the products you have for sale. We will set up the shop page and explain how you can add products to your new site.'
		),
		[ CUSTOM_PAGE ]: translate(
			"Craft a page that's perfect for anything you have in mind. You decide the title and content, and we'll create a custom layout."
		),
		[ CAREERS_PAGE ]: translate(
			"Attract top talent with a page dedicated to job opportunities. Showcase your team's culture."
		),
		[ EVENTS_PAGE ]: translate(
			"Show your upcoming events or gatherings. Keep visitors updated on what's happening."
		),
		[ DONATE_PAGE ]: translate(
			'Simplify the donation process for supporters. Help them easily contribute to your mission.'
		),
		[ NEWSLETTER_PAGE ]: translate(
			'Connect with your community through regular updates. Let visitors subscribe to stay in touch with news and events.'
		),
		[ CASE_STUDIES_PAGE ]: translate(
			'Demonstrate your expertise with real-world examples. Show your methods and results.'
		),
	};

	const contextualDescriptions: Record< BBETranslationContext, typeof defaultDescriptions > = {
		[ BBE_ONBOARDING_PAGE_PICKER_STEP ]: {
			...defaultDescriptions,
		},
		[ BBE_WEBSITE_CONTENT_FILLING_STEP ]: {
			...defaultDescriptions,
			[ BLOG_PAGE ]: translate(
				"Describe the type of blog posts you'll feature, and we'll set up the page with this description. If there are no existing posts, we'll create three to get you started."
			),
			[ CONTACT_PAGE ]: translate(
				'This page includes a contact form. You may also include other contact methods as well.'
			),
			[ SHOP_PAGE ]: translate(
				'Add a short description to explain what type of products will appear on your site. We will set up the page so this description appears above your products; you can add the products later with the editor.'
			),
			[ CUSTOM_PAGE ]: translate(
				"Provide the title and content for this page, and we'll create a custom layout."
			),
			[ DONATE_PAGE ]: translate(
				"This page includes a Donations Form block, which you can connect to your bank account later using the editor. Provide details about your cause, which we'll include on the page."
			),
			[ NEWSLETTER_PAGE ]: translate(
				'This page includes a Newsletter Subscription block, enabling visitors to subscribe via email. Provide details about the kind of updates they can expect to receive by subscribing.'
			),
		},
		[ BBE_STORE_ONBOARDING_PAGE_PICKER_STEP ]: {
			...defaultDescriptions,
			// Add customized text for page descriptions for the page picker step in the store flow here.
		},
		[ BBE_STORE_WEBSITE_CONTENT_FILLING_STEP ]: {
			...defaultDescriptions,
			// Add customized text for page descriptions for the website content form here.
		},
	};
	if ( ! context ) {
		return defaultDescriptions[ pageId ];
	}
	return contextualDescriptions[ context ][ pageId ];
}
