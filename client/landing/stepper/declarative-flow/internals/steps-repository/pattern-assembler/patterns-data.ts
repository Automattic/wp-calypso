import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import type { Pattern } from './types';

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
			},
			/*
		Discarded because there is a menu option named Blog
		and for now the blogger flow is not supported
		{
			id: 5608,
			name: 'Centered header with logo and navigation',
			category: header,
		},
		*/
			{
				id: 5582,
				name: 'Simple header',
				category: header,
			},
			{
				id: 5588,
				name: 'Header with site title and vertical navigation',
				category: header,
			},
			{
				id: 5590,
				name: 'Simple header with image background',
				category: header,
			},
			{
				id: 5593,
				name: 'Simple header with dark background',
				category: header,
			},
			{
				id: 5595,
				name: 'Simple header with image',
				category: header,
			},
			{
				id: 5601,
				name: 'Simple header with tagline',
				category: header,
			},
			{
				id: 5603,
				name: 'Header with site title and menu button',
				category: header,
			},
			{
				id: 5605,
				name: 'Header with site title and vertical navigation',
				category: header,
			},
			{
				id: 7914,
				name: 'Header with button',
				category: header,
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
			},
			{
				id: 5886,
				name: 'Footer with large font size',
				category: footer,
			},
			{
				id: 5883,
				name: 'Footer with credit line and navigation',
				category: footer,
			},
			{
				id: 5888,
				name: 'Footer with navigation and credit line',
				category: footer,
			},
			{
				id: 5877,
				name: 'Centered footer with social links',
				category: footer,
			},
			{
				id: 5873,
				name: 'Simple centered footer',
				category: footer,
			},
			{
				id: 7917,
				name: 'Footer with address, email address, and social links',
				category: footer,
			},
			{
				id: 7485,
				name: 'Footer with newsletter subscription form',
				category: footer,
			},
			{
				id: 1622,
				name: 'Footer with paragraph and links',
				category: footer,
			},
			{
				id: 5047,
				name: 'Footer with navigation, contact details, social links, and subscription form',
				category: footer,
			},
			{
				id: 5880,
				name: 'Footer with background color and three columns',
				category: footer,
			},
			{
				id: 8666,
				name: 'Left-aligned minimal footer',
				category: footer,
			},
			{
				id: 8662,
				name: 'Center-aligned minimal footer',
				category: footer,
			},
			{
				id: 8654,
				name: 'Three columns with address and open times',
				category: footer,
			},
			{
				id: 8659,
				name: 'Center-aligned minimal footer with dark background',
				category: footer,
			},
			{
				id: 8656,
				name: 'Center-aligned minimal footer with dark background and social icons',
				category: footer,
			},
			{
				id: 8650,
				name: 'Three columns with contact info and social icons',
				category: footer,
			},
		],
		[]
	);

	return footerPatterns;
};

const useSectionPatterns = () => {
	const translate = useTranslate();
	const callToAction = translate( 'Call to action' );
	const images = translate( 'Images' );
	const list = translate( 'List' );
	const numbers = translate( 'Numbers' );
	const about = translate( 'About' );
	const testimonials = translate( 'Testimonials' );
	const links = translate( 'Links' );
	const services = translate( 'Services' );
	const portfolio = translate( 'Portfolio' );
	const posts = translate( 'Posts' );

	const sectionPatterns: Pattern[] = useMemo(
		() => [
			{
				id: 7156,
				name: 'Media and text with image on the right',
				category: callToAction,
			},
			{
				id: 7153,
				name: 'Media and text with image on the left',
				category: callToAction,
			},
			{
				id: 7146,
				name: 'Four column list',
				category: callToAction,
			},
			{
				id: 7132,
				name: 'Cover image with left-aligned call to action',
				category: callToAction,
			},
			{
				id: 7159,
				name: 'Cover image with centered text and a button',
				category: callToAction,
			},
			{
				id: 3741,
				name: 'Large CTA',
				category: callToAction,
			},
			{
				id: 6303,
				name: 'Two Buttons Centered CTA',
				category: callToAction,
			},
			{
				id: 6304,
				name: 'Centered Heading with CTA',
				category: callToAction,
			},
			{
				id: 6311,
				name: 'Portfolio Project',
				category: callToAction,
			},
			{
				id: 3747,
				name: 'Hero with CTA',
				category: callToAction,
			},
			{
				id: 6308,
				name: 'Cover Image with CTA',
				category: callToAction,
			},
			{
				id: 6310,
				name: 'Gallery with description on the left',
				category: callToAction,
			},
			{
				id: 6312,
				name: 'Two Column CTA',
				category: callToAction,
			},
			{
				id: 5645,
				name: 'Four Recent Blog Posts',
				category: posts,
			},
			{
				id: 1784,
				name: 'Recent Posts',
				category: posts,
			},
			{
				id: 8421,
				name: 'Grid of posts 2x3',
				category: posts,
			},
			{
				id: 8435,
				name: 'Grid of Posts 3x2',
				category: posts,
			},
			{
				id: 7996,
				name: 'Grid of Posts 4x2',
				category: posts,
			},
			{
				id: 8437,
				name: 'List of posts',
				category: posts,
			},
			{
				id: 3213,
				name: 'Latest podcast episodes',
				category: posts,
			},
			{
				id: 6305,
				name: 'Heading with Image Grid',
				category: images,
			},
			{
				id: 7149,
				name: 'Two column image grid',
				category: images,
			},
			{
				id: 7149,
				name: 'Two column image grid',
				category: images,
			},
			{
				id: 5691,
				name: 'Three logos, heading, and paragraphs',
				category: images,
			},
			{
				id: 7143,
				name: 'Full-width image',
				category: images,
			},
			{
				id: 737,
				name: 'Logos',
				category: images,
			},
			{
				id: 1585,
				name: 'Quote and logos',
				category: images,
			},
			{
				id: 7135,
				name: 'Three columns with images and text',
				category: list,
			},
			{
				id: 789,
				name: 'Numbered list',
				category: list,
			},
			{
				id: 6712,
				name: 'List of events',
				category: list,
			},
			{
				id: 5666,
				name: 'Large numbers, heading, and paragraphs',
				category: numbers,
			},
			{
				id: 462,
				name: 'Numbers',
				category: numbers,
			},
			{
				id: 6309,
				name: '6309',
				category: about,
			},
			{
				id: 6306,
				name: 'Names List',
				category: about,
			},
			{
				id: 5663,
				name: 'Large headline',
				category: about,
			},
			{
				id: 7140,
				name: 'Left-aligned headline',
				category: about,
			},
			{
				id: 7138,
				name: 'Centered headline and text',
				category: about,
			},
			{
				id: 7161,
				name: 'Two testimonials side by side',
				category: testimonials,
			},
			{
				id: 6307,
				name: '3 Column Testimonials',
				category: testimonials,
			},
			{
				id: 6324,
				name: 'Two Column Testimonials',
				category: testimonials,
			},
			{
				id: 1600,
				name: 'Three column text and links',
				category: links,
			},
			{
				id: 6323,
				name: "FAQ's",
				category: services,
			},
			{
				id: 3743,
				name: 'Simple Two Column Layout',
				category: services,
			},
			{
				id: 39,
				name: 'Topics with Image',
				category: services,
			},
			{
				id: 6313,
				name: 'Portfolio Intro',
				category: portfolio,
			},
			{
				id: 6314,
				name: 'Centered Intro',
				category: portfolio,
			},
			{
				id: 6315,
				name: 'Large Intro Text',
				category: portfolio,
			},
			{
				id: 6316,
				name: 'Squared Media & Text',
				category: portfolio,
			},
			{
				id: 6317,
				name: 'Horizontal Media & Text',
				category: portfolio,
			},
			{
				id: 6318,
				name: 'Offset Projects',
				category: portfolio,
			},
			{
				id: 6319,
				name: 'Case Study',
				category: portfolio,
			},
			{
				id: 6320,
				name: 'Heading with two images and descriptions',
				category: portfolio,
			},
			{
				id: 6321,
				name: 'CV Text Grid',
				category: portfolio,
			},
			{
				id: 6322,
				name: 'Tall Item One Column',
				category: portfolio,
			},
		],
		[]
	);

	return sectionPatterns;
};

const useAllPatterns = () => {
	const headerPatterns = useHeaderPatterns();
	const sectionPatterns = useSectionPatterns();
	const footerPatterns = useFooterPatterns();

	return [ ...headerPatterns, ...sectionPatterns, ...footerPatterns ];
};

export { useHeaderPatterns, useFooterPatterns, useSectionPatterns, useAllPatterns };
