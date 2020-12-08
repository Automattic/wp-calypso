/**
 * External dependencies
 */
import { uniqueId, range, toArray } from 'lodash';

export const templatesFixture = [
	{
		slug: 'blank',
		title: 'Blank',
	},
	{
		slug: 'template-1',
		title: 'Template 1',
		preview: 'https://via.placeholder.com/350x150',
		previewAlt: 'Testing alt',
	},
	{
		slug: 'template-2',
		title: 'Template 2',
		preview: 'https://via.placeholder.com/300x250',
		previewAlt: 'Testing alt 2',
	},
	{
		slug: 'template-3',
		title: 'Template 3',
		preview: 'https://via.placeholder.com/500x200',
		previewAlt: 'Testing alt 3',
	},
];

export const blocksByTemplatesFixture = templatesFixture.reduce( ( acc, curr ) => {
	acc[ curr.slug ] = range( 4 ).map( () => {
		return {
			clientId: uniqueId(),
			name: 'core/paragraph',
			isValid: true,
			attributes: {
				align: 'left',
				content:
					'Visitors will want to know who is on the other side of the page. Use this space to write about yourself, your site, your business, or anything you want. Use the testimonials below to quote others, talking about the same thing – in their own words.',
				dropCap: false,
				fontWeight: '',
				textTransform: '',
				noBottomSpacing: false,
				noTopSpacing: false,
				coblocks: [],
			},
			innerBlocks: [],
			originalContent:
				'<p style="text-align:left;">Visitors will want to know who is on the other side of the page. Use this space to write about yourself, your site, your business, or anything you want. Use the testimonials below to quote others, talking about the same thing – in their own words.</p>',
		};
	} );
	return acc;
}, {} );

export const blocksFixture = toArray( blocksByTemplatesFixture );
