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
} from 'calypso/signup/difm/constants';
import type { PageId } from 'calypso/signup/difm/constants';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Provides the universal translated set of page titles available for DIFM
 *
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
			'An overview of you, your writing, or your business. What phrases would someone search on Google to find you? What can visitors expect on this site?'
		),
		[ ABOUT_PAGE ]: translate(
			'Provide background information about you or the business. Why did you start this website? What is your personal story?'
		),
		[ CONTACT_PAGE ]: translate(
			'Visitors want to get in touch with you. How can they reach you?'
		),
		[ BLOG_PAGE ]: translate(
			'Blog posts can be news stories, journal entries, or even recipes! We will set up the blog page and explain how you can add posts to your new site.'
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
			'A space to showcase your work, including examples of completed projects, photography, artwork, or even books or articles you’ve written.'
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
		[ SHOP_PAGE ]: translate(
			'Your shop page will display all the products you have for sale. We will set up the shop page and explain how you can add products to your new site.'
		),
	};

	const contextualDescriptions: Record< BBETranslationContext, typeof defaultDescriptions > = {
		[ BBE_ONBOARDING_PAGE_PICKER_STEP ]: {
			...defaultDescriptions,
		},
		[ BBE_WEBSITE_CONTENT_FILLING_STEP ]: {
			...defaultDescriptions,
			[ BLOG_PAGE ]: translate(
				'Add a short description to explain what type of posts will appear on your blog. We will set up the page so this description appears above your posts; you can add the posts later with the editor.'
			),
			[ CONTACT_PAGE ]: translate(
				'This page will include a contact form. Optionally provide text to appear above the form to let visitors know other ways they can reach you.'
			),
			[ SHOP_PAGE ]: translate(
				'Add a short description to explain what type of products will appear on your site. We will set up the page so this description appears above your products; you can add the products later with the editor.'
			),
		},
		[ BBE_STORE_ONBOARDING_PAGE_PICKER_STEP ]: {
			...defaultDescriptions,
			[ HOME_PAGE ]: translate(
				'An overview of you, your shop, or your business. What phrases would someone search on Google to find you? What can visitors purchase on this site?'
			),
		},
		[ BBE_STORE_WEBSITE_CONTENT_FILLING_STEP ]: {
			...defaultDescriptions,
			[ HOME_PAGE ]: translate(
				'An overview of you, your shop, or your business. What phrases would someone search on Google to find you? What can visitors purchase on this site?'
			),
		},
	};
	if ( ! context ) {
		return defaultDescriptions[ pageId ];
	}
	return contextualDescriptions[ context ][ pageId ];
}
