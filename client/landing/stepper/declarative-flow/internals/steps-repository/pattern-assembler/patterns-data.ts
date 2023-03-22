import { useMemo } from 'react';
import type { Pattern } from './types';

const useHeaderPatterns = () => {
	const header = 'header';

	// All headers in dotcompatterns
	const headerPatterns: Pattern[] = useMemo(
		() => [
			{
				id: 5579,
				name: 'Centered header',
				categories: [ header ],
			},
			{
				id: 5608,
				name: 'Centered header with logo and navigation',
				categories: [ header ],
			},
			{
				id: 5582,
				name: 'Simple header',
				categories: [ header ],
			},
			{
				id: 5588,
				name: 'Header with site title and vertical navigation',
				categories: [ header ],
			},
			{
				id: 5590,
				name: 'Simple header with image background',
				categories: [ header ],
			},
			{
				id: 5593,
				name: 'Simple header with dark background',
				categories: [ header ],
			},
			{
				id: 5595,
				name: 'Simple header with image',
				categories: [ header ],
			},
			{
				id: 5601,
				name: 'Simple header with tagline',
				categories: [ header ],
			},
			{
				id: 5603,
				name: 'Header with site title and menu button',
				categories: [ header ],
			},
			{
				id: 5605,
				name: 'Header with site title and vertical navigation',
				categories: [ header ],
			},
			{
				id: 7914,
				name: 'Header with button',
				categories: [ header ],
			},
		],
		[]
	);

	return headerPatterns;
};

const useFooterPatterns = () => {
	const footer = 'footer';

	// All footers in dotcompatterns
	const footerPatterns: Pattern[] = useMemo(
		() => [
			{
				id: 5316,
				name: 'Footer with social icons, address, e-mail, and telephone number',
				categories: [ footer ],
			},
			{
				id: 5886,
				name: 'Footer with large font size',
				categories: [ footer ],
			},
			{
				id: 5883,
				name: 'Footer with credit line and navigation',
				categories: [ footer ],
			},
			{
				id: 5888,
				name: 'Footer with navigation and credit line',
				categories: [ footer ],
			},
			{
				id: 5877,
				name: 'Centered footer with social links',
				categories: [ footer ],
			},
			{
				id: 5873,
				name: 'Simple centered footer',
				categories: [ footer ],
			},
			{
				id: 7917,
				name: 'Footer with address, email address, and social links',
				categories: [ footer ],
			},
			{
				id: 7485,
				name: 'Footer with newsletter subscription form',
				categories: [ footer ],
			},
			{
				id: 1622,
				name: 'Footer with paragraph and links',
				categories: [ footer ],
			},
			{
				id: 5047,
				name: 'Footer with navigation, contact details, social links, and subscription form',
				categories: [ footer ],
			},
			{
				id: 5880,
				name: 'Footer with background color and three columns',
				categories: [ footer ],
			},
			{
				id: 8666,
				name: 'Left-aligned minimal footer',
				categories: [ footer ],
			},
			{
				id: 8662,
				name: 'Center-aligned minimal footer',
				categories: [ footer ],
			},
			{
				id: 8654,
				name: 'Three columns with address and open times',
				categories: [ footer ],
			},
			{
				id: 8659,
				name: 'Center-aligned minimal footer with dark background',
				categories: [ footer ],
			},
			{
				id: 8656,
				name: 'Center-aligned minimal footer with dark background and social icons',
				categories: [ footer ],
			},
			{
				id: 8650,
				name: 'Three columns with contact info and social icons',
				categories: [ footer ],
			},
		],
		[]
	);

	return footerPatterns;
};

const useSectionPatterns = () => {
	const about = 'about';
	const callToAction = 'call-to-action';
	const images = 'images';
	const links = 'links';
	const list = 'list';
	const numbers = 'numbers';
	const portfolio = 'portfolio';
	const posts = 'posts';
	const services = 'services';
	const testimonials = 'testimonials';

	const sectionPatterns: Pattern[] = useMemo(
		() => [
			{
				id: 7156,
				name: 'Media and text with image on the right',
				categories: [ callToAction ],
			},
			{
				id: 7153,
				name: 'Media and text with image on the left',
				categories: [ callToAction ],
			},
			{
				id: 7146,
				name: 'Four column list',
				categories: [ callToAction ],
			},
			{
				id: 7132,
				name: 'Cover image with left-aligned call to action',
				categories: [ callToAction ],
			},
			{
				id: 7159,
				name: 'Cover image with centered text and a button',
				categories: [ callToAction ],
			},
			{
				id: 3741,
				name: 'Large CTA',
				categories: [ callToAction ],
			},
			{
				id: 9768,
				name: 'Centered call to action',
				categories: [ callToAction ],
			},
			{
				id: 9754,
				name: 'Full-width media and text with background',
				categories: [ callToAction ],
			},
			{
				id: 9751,
				name: 'Full-width media and text with background',
				categories: [ callToAction ],
			},
			{
				id: 9748,
				name: 'Call to action with image on the left',
				categories: [ callToAction ],
			},
			{
				id: 9745,
				name: 'Call to action with image on the right',
				categories: [ callToAction ],
			},
			{
				id: 6303,
				name: 'Two Buttons Centered CTA',
				categories: [ callToAction ],
			},
			{
				id: 6304,
				name: 'Centered Heading with CTA',
				categories: [ callToAction ],
			},
			{
				id: 6311,
				name: 'Portfolio Project',
				categories: [ callToAction ],
			},
			{
				id: 3747,
				name: 'Hero with CTA',
				categories: [ callToAction ],
			},
			{
				id: 6308,
				name: 'Cover Image with CTA',
				categories: [ callToAction ],
			},
			{
				id: 6310,
				name: 'Gallery with description on the left',
				categories: [ callToAction ],
			},
			{
				id: 6312,
				name: 'Two Column CTA',
				categories: [ callToAction ],
			},
			{
				id: 6305,
				name: 'Heading with Image Grid',
				categories: [ images ],
			},
			{
				id: 7149,
				name: 'Two column image grid',
				categories: [ images ],
			},
			{
				id: 5691,
				name: 'Three logos, heading, and paragraphs',
				categories: [ images ],
			},
			{
				id: 7143,
				name: 'Full-width image',
				categories: [ images ],
			},
			{
				id: 9766,
				name: 'Heading and three images with rounded borders',
				categories: [ images ],
			},
			{
				id: 9763,
				name: 'Three columns with images',
				categories: [ images ],
			},
			{
				id: 9760,
				name: 'Three columns with heading, text, and image',
				categories: [ images ],
			},
			{
				id: 9757,
				name: 'A heading, paragraph and two images',
				categories: [ images ],
			},
			{
				id: 737,
				name: 'Logos',
				categories: [ images ],
			},
			{
				id: 1585,
				name: 'Quote and logos',
				categories: [ images ],
			},
			{
				id: 7135,
				name: 'Three columns with images and text',
				categories: [ list ],
			},
			{
				id: 789,
				name: 'Numbered list',
				categories: [ list ],
			},
			{
				id: 6712,
				name: 'List of events',
				categories: [ list ],
			},
			{
				id: 5666,
				name: 'Large numbers, heading, and paragraphs',
				categories: [ numbers ],
			},
			{
				id: 462,
				name: 'Numbers',
				categories: [ numbers ],
			},
			{
				id: 6309,
				name: 'Names list',
				categories: [ about ],
			},
			{
				id: 6306,
				name: 'Team',
				categories: [ about ],
			},
			{
				id: 5663,
				name: 'Large headline',
				categories: [ about ],
			},
			{
				id: 7140,
				name: 'Left-aligned headline',
				categories: [ about ],
			},
			{
				id: 7138,
				name: 'Centered headline and text',
				categories: [ about ],
			},
			{
				id: 7161,
				name: 'Two testimonials side by side',
				categories: [ testimonials ],
			},
			{
				id: 6307,
				name: '3 Column Testimonials',
				categories: [ testimonials ],
			},
			{
				id: 6324,
				name: 'Two Column Testimonials',
				categories: [ testimonials ],
			},
			{
				id: 1600,
				name: 'Three column text and links',
				categories: [ links ],
			},
			{
				id: 6323,
				name: "FAQ's",
				categories: [ services ],
			},
			{
				id: 3743,
				name: 'Simple Two Column Layout',
				categories: [ services ],
			},
			{
				id: 39,
				name: 'Topics with Image',
				categories: [ services ],
			},
			{
				id: 6313,
				name: 'Portfolio Intro',
				categories: [ portfolio ],
			},
			{
				id: 6314,
				name: 'Centered Intro',
				categories: [ portfolio ],
			},
			{
				id: 6315,
				name: 'Large Intro Text',
				categories: [ portfolio ],
			},
			{
				id: 6316,
				name: 'Squared Media & Text',
				categories: [ portfolio ],
			},
			{
				id: 6318,
				name: 'Offset Projects',
				categories: [ portfolio ],
			},
			{
				id: 6320,
				name: 'Heading with two images and descriptions',
				categories: [ portfolio ],
			},
			{
				id: 6321,
				name: 'CV Text Grid',
				categories: [ portfolio ],
			},
			{
				id: 1784,
				name: 'Recent Posts',
				categories: [ posts ],
			},
			{
				id: 8437,
				name: 'List of posts',
				categories: [ posts ],
			},
			{
				id: 8421,
				name: 'Grid of posts 2x3',
				categories: [ posts ],
			},
			{
				id: 8435,
				name: 'Grid of Posts 3x2',
				categories: [ posts ],
			},
			{
				id: 5645,
				name: 'Four Recent Blog Posts',
				categories: [ posts ],
			},
			{
				id: 7996,
				name: 'Grid of Posts 4x2',
				categories: [ posts ],
			},
			{
				id: 3213,
				name: 'Latest podcast episodes',
				categories: [ posts ],
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
