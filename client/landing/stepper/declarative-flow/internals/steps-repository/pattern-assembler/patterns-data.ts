import { isEnabled } from '@automattic/calypso-config';
import { useMemo } from 'react';
import useDotcomPatterns from './hooks/use-dotcom-patterns';
import type { Pattern } from './types';

const useHeaderPatterns = ( dotcomHeaderPatterns: Pattern[] ) => {
	const header = {
		slug: 'header',
	};

	// All headers in dotcompatterns
	const headerPatterns: Pattern[] = useMemo(
		() => [
			{
				ID: 5579,
				title: 'Centered header',
				name: '',
				categories: { header },
			},
			{
				ID: 5608,
				name: '',
				title: 'Centered header with logo and navigation',
				categories: { header },
			},
			{
				ID: 5582,
				name: '',
				title: 'Simple header',
				categories: { header },
			},
			{
				ID: 5588,
				name: '',
				title: 'Header with site title and vertical navigation',
				categories: { header },
			},
			{
				ID: 5590,
				name: '',
				title: 'Simple header with image background',
				categories: { header },
			},
			{
				ID: 5593,
				name: '',
				title: 'Simple header with dark background',
				categories: { header },
			},
			{
				ID: 5595,
				name: '',
				title: 'Simple header with image',
				categories: { header },
			},
			{
				ID: 5601,
				name: '',
				title: 'Simple header with tagline',
				categories: { header },
			},
			{
				ID: 5603,
				name: '',
				title: 'Header with site title and menu button',
				categories: { header },
			},
			{
				ID: 5605,
				name: '',
				title: 'Header with site title and vertical navigation',
				categories: { header },
			},
			{
				ID: 7914,
				name: '',
				title: 'Header with button',
				categories: { header },
			},
		],
		[]
	);

	if ( isEnabled( 'pattern-assembler/dotcompatterns' ) ) {
		return dotcomHeaderPatterns;
	}

	return headerPatterns;
};

const useFooterPatterns = ( dotcomFooterPatterns: Pattern[] ) => {
	const footer = {
		slug: 'footer',
	};

	// All footers in dotcompatterns
	const footerPatterns: Pattern[] = useMemo(
		() => [
			{
				ID: 5316,
				name: '',
				title: 'Footer with social icons, address, e-mail, and telephone number',
				categories: { footer },
			},
			{
				ID: 5886,
				name: '',
				title: 'Footer with large font size',
				categories: { footer },
			},
			{
				ID: 5883,
				name: '',
				title: 'Footer with credit line and navigation',
				categories: { footer },
			},
			{
				ID: 5888,
				name: '',
				title: 'Footer with navigation and credit line',
				categories: { footer },
			},
			{
				ID: 5877,
				name: '',
				title: 'Centered footer with social links',
				categories: { footer },
			},
			{
				ID: 5873,
				name: '',
				title: 'Simple centered footer',
				categories: { footer },
			},
			{
				ID: 7917,
				name: '',
				title: 'Footer with address, email address, and social links',
				categories: { footer },
			},
			{
				ID: 7485,
				name: '',
				title: 'Footer with newsletter subscription form',
				categories: { footer },
			},
			{
				ID: 1622,
				name: '',
				title: 'Footer with paragraph and links',
				categories: { footer },
			},
			{
				ID: 5047,
				name: '',
				title: 'Footer with navigation, contact details, social links, and subscription form',
				categories: { footer },
			},
			{
				ID: 5880,
				name: '',
				title: 'Footer with background color and three columns',
				categories: { footer },
			},
			{
				ID: 8666,
				name: '',
				title: 'Left-aligned minimal footer',
				categories: { footer },
			},
			{
				ID: 8662,
				name: '',
				title: 'Center-aligned minimal footer',
				categories: { footer },
			},
			{
				ID: 8654,
				name: '',
				title: 'Three columns with address and open times',
				categories: { footer },
			},
			{
				ID: 8659,
				name: '',
				title: 'Center-aligned minimal footer with dark background',
				categories: { footer },
			},
			{
				ID: 8656,
				name: '',
				title: 'Center-aligned minimal footer with dark background and social icons',
				categories: { footer },
			},
			{
				ID: 8650,
				name: '',
				title: 'Three columns with contact info and social icons',
				categories: { footer },
			},
		],
		[]
	);

	if ( isEnabled( 'pattern-assembler/dotcompatterns' ) ) {
		return dotcomFooterPatterns;
	}

	return footerPatterns;
};

const useSectionPatterns = () => {
	const about = { slug: 'about' };
	const callToAction = { slug: 'call-to-action' };
	const images = { slug: 'images' };
	const links = { slug: 'links' };
	const list = { slug: 'list' };
	const numbers = { slug: 'numbers' };
	const portfolio = { slug: 'portfolio' };
	const posts = { slug: 'posts' };
	const services = { slug: 'services' };
	const testimonials = { slug: 'testimonials' };

	const sectionPatterns: Pattern[] = useMemo(
		() => [
			{
				ID: 7156,
				name: '',
				title: 'Media and text with image on the right',
				categories: { callToAction },
			},
			{
				ID: 7153,
				name: '',
				title: 'Media and text with image on the left',
				categories: { callToAction },
			},
			{
				ID: 7146,
				name: '',
				title: 'Four column list',
				categories: { callToAction },
			},
			{
				ID: 7132,
				name: '',
				title: 'Cover image with left-aligned call to action',
				categories: { callToAction },
			},
			{
				ID: 7159,
				name: '',
				title: 'Cover image with centered text and a button',
				categories: { callToAction },
			},
			{
				ID: 3741,
				name: '',
				title: 'Large CTA',
				categories: { callToAction },
			},
			{
				ID: 9768,
				name: '',
				title: 'Centered call to action',
				categories: { callToAction },
			},
			{
				ID: 9754,
				name: '',
				title: 'Full-width media and text with background',
				categories: { callToAction },
			},
			{
				ID: 9751,
				name: '',
				title: 'Full-width media and text with background',
				categories: { callToAction },
			},
			{
				ID: 9748,
				name: '',
				title: 'Call to action with image on the left',
				categories: { callToAction },
			},
			{
				ID: 9745,
				name: '',
				title: 'Call to action with image on the right',
				categories: { callToAction },
			},
			{
				ID: 6303,
				name: '',
				title: 'Two Buttons Centered CTA',
				categories: { callToAction },
			},
			{
				ID: 6304,
				name: '',
				title: 'Centered Heading with CTA',
				categories: { callToAction },
			},
			{
				ID: 6311,
				name: '',
				title: 'Portfolio Project',
				categories: { callToAction },
			},
			{
				ID: 3747,
				name: '',
				title: 'Hero with CTA',
				categories: { callToAction },
			},
			{
				ID: 6308,
				name: '',
				title: 'Cover Image with CTA',
				categories: { callToAction },
			},
			{
				ID: 6310,
				name: '',
				title: 'Gallery with description on the left',
				categories: { callToAction },
			},
			{
				ID: 6312,
				name: '',
				title: 'Two Column CTA',
				categories: { callToAction },
			},
			{
				ID: 6305,
				name: '',
				title: 'Heading with Image Grid',
				categories: { images },
			},
			{
				ID: 7149,
				name: '',
				title: 'Two column image grid',
				categories: { images },
			},
			{
				ID: 5691,
				name: '',
				title: 'Three logos, heading, and paragraphs',
				categories: { images },
			},
			{
				ID: 7143,
				name: '',
				title: 'Full-width image',
				categories: { images },
			},
			{
				ID: 9766,
				name: '',
				title: 'Heading and three images with rounded borders',
				categories: { images },
			},
			{
				ID: 9763,
				name: '',
				title: 'Three columns with images',
				categories: { images },
			},
			{
				ID: 9760,
				name: '',
				title: 'Three columns with heading, text, and image',
				categories: { images },
			},
			{
				ID: 9757,
				name: '',
				title: 'A heading, paragraph and two images',
				categories: { images },
			},
			{
				ID: 737,
				name: '',
				title: 'Logos',
				categories: { images },
			},
			{
				ID: 1585,
				name: '',
				title: 'Quote and logos',
				categories: { images },
			},
			{
				ID: 7135,
				name: '',
				title: 'Three columns with images and text',
				categories: { list },
			},
			{
				ID: 789,
				name: '',
				title: 'Numbered list',
				categories: { list },
			},
			{
				ID: 6712,
				name: '',
				title: 'List of events',
				categories: { list },
			},
			{
				ID: 5666,
				name: '',
				title: 'Large numbers, heading, and paragraphs',
				categories: { numbers },
			},
			{
				ID: 462,
				name: '',
				title: 'Numbers',
				categories: { numbers },
			},
			{
				ID: 6309,
				name: '',
				title: 'Names list',
				categories: { about },
			},
			{
				ID: 6306,
				name: '',
				title: 'Team',
				categories: { about },
			},
			{
				ID: 5663,
				name: '',
				title: 'Large headline',
				categories: { about },
			},
			{
				ID: 7140,
				name: '',
				title: 'Left-aligned headline',
				categories: { about },
			},
			{
				ID: 7138,
				name: '',
				title: 'Centered headline and text',
				categories: { about },
			},
			{
				ID: 7161,
				name: '',
				title: 'Two testimonials side by side',
				categories: { testimonials },
			},
			{
				ID: 6307,
				name: '',
				title: '3 Column Testimonials',
				categories: { testimonials },
			},
			{
				ID: 6324,
				name: '',
				title: 'Two Column Testimonials',
				categories: { testimonials },
			},
			{
				ID: 1600,
				name: '',
				title: 'Three column text and links',
				categories: { links },
			},
			{
				ID: 6323,
				name: '',
				title: "FAQ's",
				categories: { services },
			},
			{
				ID: 3743,
				name: '',
				title: 'Simple Two Column Layout',
				categories: { services },
			},
			{
				ID: 39,
				name: '',
				title: 'Topics with Image',
				categories: { services },
			},
			{
				ID: 6313,
				name: '',
				title: 'Portfolio Intro',
				categories: { portfolio },
			},
			{
				ID: 6314,
				name: '',
				title: 'Centered Intro',
				categories: { portfolio },
			},
			{
				ID: 6315,
				name: '',
				title: 'Large Intro Text',
				categories: { portfolio },
			},
			{
				ID: 6316,
				name: '',
				title: 'Squared Media & Text',
				categories: { portfolio },
			},
			{
				ID: 6318,
				name: '',
				title: 'Offset Projects',
				categories: { portfolio },
			},
			{
				ID: 6320,
				name: '',
				title: 'Heading with two images and descriptions',
				categories: { portfolio },
			},
			{
				ID: 6321,
				name: '',
				title: 'CV Text Grid',
				categories: { portfolio },
			},
			{
				ID: 1784,
				name: '',
				title: 'Recent Posts',
				categories: { posts },
			},
			{
				ID: 8437,
				name: '',
				title: 'List of posts',
				categories: { posts },
			},
			{
				ID: 8421,
				name: '',
				title: 'Grid of posts 2x3',
				categories: { posts },
			},
			{
				ID: 8435,
				name: '',
				title: 'Grid of Posts 3x2',
				categories: { posts },
			},
			{
				ID: 5645,
				name: '',
				title: 'Four Recent Blog Posts',
				categories: { posts },
			},
			{
				ID: 7996,
				name: '',
				title: 'Grid of Posts 4x2',
				categories: { posts },
			},
			{
				ID: 3213,
				name: '',
				title: 'Latest podcast episodes',
				categories: { posts },
			},
		],
		[]
	);

	return sectionPatterns;
};

const useAllPatterns = ( lang: string | undefined ) => {
	const headerPatterns = useHeaderPatterns( [] );
	const sectionPatterns = useSectionPatterns();
	const footerPatterns = useFooterPatterns( [] );
	const dotcomPatterns = useDotcomPatterns( lang );

	if ( isEnabled( 'pattern-assembler/dotcompatterns' ) ) {
		return dotcomPatterns;
	}

	return [ ...headerPatterns, ...sectionPatterns, ...footerPatterns ];
};

export { useHeaderPatterns, useFooterPatterns, useSectionPatterns, useAllPatterns };
