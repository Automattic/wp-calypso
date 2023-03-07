import { Onboard } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useIntent } from '../../../../hooks/use-intent';
import type { Pattern } from './types';

const SiteIntent = Onboard.SiteIntent;

const useHeaderPatterns = () => {
	const translate = useTranslate();
	const header = translate( 'Header' );

	// All headers in dotcompatterns
	const headerPatterns: Pattern[] = useMemo(
		() => [
			{
				id: 5579,
				name: 'Centered header',
				category: header,
				category_slug: 'header',
			},
			{
				id: 5608,
				name: 'Centered header with logo and navigation',
				category: header,
			},
			{
				id: 5582,
				name: 'Simple header',
				category: header,
				category_slug: 'header',
			},
			{
				id: 5588,
				name: 'Header with site title and vertical navigation',
				category: header,
				category_slug: 'header',
			},
			{
				id: 5590,
				name: 'Simple header with image background',
				category: header,
				category_slug: 'header',
			},
			{
				id: 5593,
				name: 'Simple header with dark background',
				category: header,
				category_slug: 'header',
			},
			{
				id: 5595,
				name: 'Simple header with image',
				category: header,
				category_slug: 'header',
			},
			{
				id: 5601,
				name: 'Simple header with tagline',
				category: header,
				category_slug: 'header',
			},
			{
				id: 5603,
				name: 'Header with site title and menu button',
				category: header,
				category_slug: 'header',
			},
			{
				id: 5605,
				name: 'Header with site title and vertical navigation',
				category: header,
				category_slug: 'header',
			},
			{
				id: 7914,
				name: 'Header with button',
				category: header,
				category_slug: 'header',
			},
		],
		[]
	);

	return headerPatterns;
};

const useFooterPatterns = () => {
	const translate = useTranslate();
	const footer = translate( 'Footer' );

	// All footers in dotcompatterns
	const footerPatterns: Pattern[] = useMemo(
		() => [
			{
				id: 5316,
				name: 'Footer with social icons, address, e-mail, and telephone number',
				category: footer,
				category_slug: 'footer',
			},
			{
				id: 5886,
				name: 'Footer with large font size',
				category: footer,
				category_slug: 'footer',
			},
			{
				id: 5883,
				name: 'Footer with credit line and navigation',
				category: footer,
				category_slug: 'footer',
			},
			{
				id: 5888,
				name: 'Footer with navigation and credit line',
				category: footer,
				category_slug: 'footer',
			},
			{
				id: 5877,
				name: 'Centered footer with social links',
				category: footer,
				category_slug: 'footer',
			},
			{
				id: 5873,
				name: 'Simple centered footer',
				category: footer,
				category_slug: 'footer',
			},
			{
				id: 7917,
				name: 'Footer with address, email address, and social links',
				category: footer,
				category_slug: 'footer',
			},
			{
				id: 7485,
				name: 'Footer with newsletter subscription form',
				category: footer,
				category_slug: 'footer',
			},
			{
				id: 1622,
				name: 'Footer with paragraph and links',
				category: footer,
				category_slug: 'footer',
			},
			{
				id: 5047,
				name: 'Footer with navigation, contact details, social links, and subscription form',
				category: footer,
				category_slug: 'footer',
			},
			{
				id: 5880,
				name: 'Footer with background color and three columns',
				category: footer,
				category_slug: 'footer',
			},
			{
				id: 8666,
				name: 'Left-aligned minimal footer',
				category: footer,
				category_slug: 'footer',
			},
			{
				id: 8662,
				name: 'Center-aligned minimal footer',
				category: footer,
				category_slug: 'footer',
			},
			{
				id: 8654,
				name: 'Three columns with address and open times',
				category: footer,
				category_slug: 'footer',
			},
			{
				id: 8659,
				name: 'Center-aligned minimal footer with dark background',
				category: footer,
				category_slug: 'footer',
			},
			{
				id: 8656,
				name: 'Center-aligned minimal footer with dark background and social icons',
				category: footer,
				category_slug: 'footer',
			},
			{
				id: 8650,
				name: 'Three columns with contact info and social icons',
				category: footer,
				category_slug: 'footer',
			},
		],
		[]
	);

	return footerPatterns;
};

const useSectionPatterns = () => {
	const intent = useIntent();
	const translate = useTranslate();

	const about = translate( 'About' );
	const callToAction = translate( 'Call to action' );
	const images = translate( 'Images' );
	const links = translate( 'Links' );
	const list = translate( 'List' );
	const numbers = translate( 'Numbers' );
	const portfolio = translate( 'Portfolio' );
	const posts = translate( 'Posts' );
	const services = translate( 'Services' );
	const testimonials = translate( 'Testimonials' );

	const sectionPatterns: Pattern[] = useMemo( () => {
		let patterns = [
			{
				id: 7156,
				name: 'Media and text with image on the right',
				category: callToAction,
				category_slug: 'call-to-action',
			},
			{
				id: 7153,
				name: 'Media and text with image on the left',
				category: callToAction,
				category_slug: 'call-to-action',
			},
			{
				id: 7146,
				name: 'Four column list',
				category: callToAction,
				category_slug: 'call-to-action',
			},
			{
				id: 7132,
				name: 'Cover image with left-aligned call to action',
				category: callToAction,
				category_slug: 'call-to-action',
			},
			{
				id: 7159,
				name: 'Cover image with centered text and a button',
				category: callToAction,
				category_slug: 'call-to-action',
			},
			{
				id: 3741,
				name: 'Large CTA',
				category: callToAction,
				category_slug: 'call-to-action',
			},
			{
				id: 6303,
				name: 'Two Buttons Centered CTA',
				category: callToAction,
				category_slug: 'call-to-action',
			},
			{
				id: 6304,
				name: 'Centered Heading with CTA',
				category: callToAction,
				category_slug: 'call-to-action',
			},
			{
				id: 6311,
				name: 'Portfolio Project',
				category: callToAction,
				category_slug: 'call-to-action',
			},
			{
				id: 3747,
				name: 'Hero with CTA',
				category: callToAction,
				category_slug: 'call-to-action',
			},
			{
				id: 6308,
				name: 'Cover Image with CTA',
				category: callToAction,
				category_slug: 'call-to-action',
			},
			{
				id: 6310,
				name: 'Gallery with description on the left',
				category: callToAction,
				category_slug: 'call-to-action',
			},
			{
				id: 6312,
				name: 'Two Column CTA',
				category: callToAction,
				category_slug: 'call-to-action',
			},
			{
				id: 6305,
				name: 'Heading with Image Grid',
				category: images,
				category_slug: 'images',
			},
			{
				id: 7149,
				name: 'Two column image grid',
				category: images,
				category_slug: 'images',
			},
			{
				id: 5691,
				name: 'Three logos, heading, and paragraphs',
				category: images,
				category_slug: 'images',
			},
			{
				id: 7143,
				name: 'Full-width image',
				category: images,
				category_slug: 'images',
			},
			{
				id: 737,
				name: 'Logos',
				category: images,
				category_slug: 'images',
			},
			{
				id: 1585,
				name: 'Quote and logos',
				category: images,
				category_slug: 'images',
			},
			{
				id: 7135,
				name: 'Three columns with images and text',
				category: list,
				category_slug: 'list',
			},
			{
				id: 789,
				name: 'Numbered list',
				category: list,
				category_slug: 'list',
			},
			{
				id: 6712,
				name: 'List of events',
				category: list,
				category_slug: 'list',
			},
			{
				id: 5666,
				name: 'Large numbers, heading, and paragraphs',
				category: numbers,
				category_slug: 'numbers',
			},
			{
				id: 462,
				name: 'Numbers',
				category: numbers,
				category_slug: 'numbers',
			},
			{
				id: 6309,
				name: '6309',
				category: about,
				category_slug: 'about',
			},
			{
				id: 6306,
				name: 'Names List',
				category: about,
				category_slug: 'about',
			},
			{
				id: 5663,
				name: 'Large headline',
				category: about,
				category_slug: 'about',
			},
			{
				id: 7140,
				name: 'Left-aligned headline',
				category: about,
				category_slug: 'about',
			},
			{
				id: 7138,
				name: 'Centered headline and text',
				category: about,
				category_slug: 'about',
			},
			{
				id: 7161,
				name: 'Two testimonials side by side',
				category: testimonials,
				category_slug: 'testimonials',
			},
			{
				id: 6307,
				name: '3 Column Testimonials',
				category: testimonials,
				category_slug: 'testimonials',
			},
			{
				id: 6324,
				name: 'Two Column Testimonials',
				category: testimonials,
				category_slug: 'testimonials',
			},
			{
				id: 1600,
				name: 'Three column text and links',
				category: links,
				category_slug: 'links',
			},
			{
				id: 6323,
				name: "FAQ's",
				category: services,
				category_slug: 'services',
			},
			{
				id: 3743,
				name: 'Simple Two Column Layout',
				category: services,
				category_slug: 'services',
			},
			{
				id: 39,
				name: 'Topics with Image',
				category: services,
				category_slug: 'services',
			},
			{
				id: 6313,
				name: 'Portfolio Intro',
				category: portfolio,
				category_slug: 'portfolio',
			},
			{
				id: 6314,
				name: 'Centered Intro',
				category: portfolio,
				category_slug: 'portfolio',
			},
			{
				id: 6315,
				name: 'Large Intro Text',
				category: portfolio,
				category_slug: 'portfolio',
			},
			{
				id: 6316,
				name: 'Squared Media & Text',
				category: portfolio,
				category_slug: 'portfolio',
			},
			{
				id: 6317,
				name: 'Horizontal Media & Text',
				category: portfolio,
				category_slug: 'portfolio',
			},
			{
				id: 6318,
				name: 'Offset Projects',
				category: portfolio,
				category_slug: 'portfolio',
			},
			{
				id: 6319,
				name: 'Case Study',
				category: portfolio,
				category_slug: 'portfolio',
			},
			{
				id: 6320,
				name: 'Heading with two images and descriptions',
				category: portfolio,
				category_slug: 'portfolio',
			},
			{
				id: 6321,
				name: 'CV Text Grid',
				category: portfolio,
				category_slug: 'portfolio',
			},
			{
				id: 6322,
				name: 'Tall Item One Column',
				category: portfolio,
				category_slug: 'portfolio',
			},
			{
				id: 1784,
				name: 'Recent Posts',
				category: posts,
				category_slug: 'posts',
			},
			{
				id: 8437,
				name: 'List of posts',
				category: posts,
				category_slug: 'posts',
			},
			{
				id: 8421,
				name: 'Grid of posts 2x3',
				category: posts,
				category_slug: 'posts',
			},
			{
				id: 8435,
				name: 'Grid of Posts 3x2',
				category: posts,
				category_slug: 'posts',
			},
			{
				id: 5645,
				name: 'Four Recent Blog Posts',
				category: posts,
				category_slug: 'posts',
			},
			{
				id: 7996,
				name: 'Grid of Posts 4x2',
				category: posts,
				category_slug: 'posts',
			},
			{
				id: 3213,
				name: 'Latest podcast episodes',
				category: posts,
				category_slug: 'posts',
			},
		];

		if ( intent === SiteIntent.Write ) {
			// In the Write flow, move posts patterns to the first position
			patterns = patterns.sort( ( a, b ) => {
				if ( a.category === b.category ) {
					return 0;
				} else if ( a.category === posts ) {
					return -1;
				} else if ( b.category === posts ) {
					return 1;
				}

				return 0;
			} );
		}

		return patterns;
	}, [] );

	return sectionPatterns;
};

const useAllPatterns = () => {
	const headerPatterns = useHeaderPatterns();
	const sectionPatterns = useSectionPatterns();
	const footerPatterns = useFooterPatterns();

	return [ ...headerPatterns, ...sectionPatterns, ...footerPatterns ];
};

export { useHeaderPatterns, useFooterPatterns, useSectionPatterns, useAllPatterns };
