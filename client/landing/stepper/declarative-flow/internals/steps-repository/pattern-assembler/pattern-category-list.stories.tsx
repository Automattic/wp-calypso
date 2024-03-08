import { action } from '@storybook/addon-actions';
import { Story, Meta } from '@storybook/react';
import { ComponentProps } from 'react';
import { documentHeadStoreMock, ReduxDecorator } from 'calypso/__mocks__/storybook/redux';
import PatternCategoryList from './pattern-category-list';

import './style.scss';
import './pattern-category-list.scss';

export default {
	title: 'client/landing/pattern-assembler/PatternCategoryList',
	component: PatternCategoryList,
	decorators: [
		( Story ) => {
			return (
				<ReduxDecorator store={ { ...documentHeadStoreMock } }>
					<Story></Story>
				</ReduxDecorator>
			);
		},
		( Story ) => {
			return (
				<div
					className="pattern-assembler"
					/**
					 * The following style is for fixing the position of the PatternListPanel.
					 * It depends on `348px` since it uses `margin-inline-start: 348px;` for its position.
					 */
					style={ {
						display: 'block',
						width: '348px',
						padding: '32px',
						boxSizing: 'border-box',
						backgroundColor: '#fdfdfd',
					} }
				>
					<Story></Story>
				</div>
			);
		},
	],
} as Meta;

type PatternCategoryListStory = Story< ComponentProps< typeof PatternCategoryList > >;
const Template: PatternCategoryListStory = ( args ) => <PatternCategoryList { ...args } />;

const defaultArgs = {
	categories: [
		{ name: 'about', label: 'About', description: 'Introduce yourself.' },
		{ name: 'blog', label: 'Blog' },
	],
	patternCountMapByCategory: {
		about: 2,
		blog: 2,
	},
	patternsMapByCategory: {
		about: [
			{
				ID: 7814,
				site_id: 174455321,
				title: 'Hero with Heading and Cover Image',
				name: 'hero-with-heading-and-cover-image',
				description: '',
				html: '<div>test</div>',
				categories: { about: { slug: 'about', title: 'About', description: '' } },
				virtual_theme_categories: [],
				tags: { pattern: { slug: 'pattern', title: 'Pattern', description: '' } },
				pattern_meta: { is_web: true, is_mobile: false },
				source_url: 'https://dotcompatterns.wordpress.com/?p=7814',
				modified_date: '2022-11-30 09:20:46',
			},
			{
				ID: 6306,
				site_id: 174455321,
				title: 'Team',
				name: 'team-4',
				description: '',
				html: '<div>test</div>',
				categories: {
					about: { slug: 'about', title: 'About', description: '' },
					wireframe: { slug: 'wireframe', title: 'Wireframe', description: '' },
				},
				virtual_theme_categories: [],
				tags: { pattern: { slug: 'pattern', title: 'Pattern', description: '' } },
				pattern_meta: { is_web: true, is_mobile: false },
				source_url: 'https://blockpatterns.mystagingwebsite.com/?p=64',
				modified_date: '2023-03-29 07:25:38',
			},
		],
		blog: [
			{
				ID: 3681,
				site_id: 174455321,
				title: 'Blog',
				name: 'blog-8',
				description: '',
				html: '<div>test</div>',
				categories: {
					blog: { slug: 'blog', title: 'Blog', description: '' },
					featured: { slug: 'featured', title: 'Featured', description: '' },
				},
				virtual_theme_categories: [],
				tags: {
					layout: { slug: 'layout', title: 'Layout', description: '' },
					pattern: { slug: 'pattern', title: 'Pattern', description: '' },
				},
				pattern_meta: { is_mobile: true, is_web: true },
				source_url: 'https://dotcompatterns.wordpress.com/?p=3681',
				modified_date: '2023-02-10 13:55:09',
			},
			{
				ID: 1593,
				site_id: 174455321,
				title: 'Heading and Three Images',
				name: 'heading-and-three-images',
				description: '',
				html: '<div>test</div>',
				categories: {
					blog: { slug: 'blog', title: 'Blog', description: '' },
					featured: { slug: 'featured', title: 'Featured', description: '' },
				},
				virtual_theme_categories: [],
				tags: { pattern: { slug: 'pattern', title: 'Pattern', description: '' } },
				pattern_meta: { is_web: true, is_mobile: false },
				source_url: 'https://dotcompatterns.wordpress.com/?p=1593',
				modified_date: '2022-10-04 16:38:31',
			},
		],
	},
	selectedCategory: 'about',
	onSelectCategory: action( 'onSelectCategory' ),
};

export const Default = Template.bind( {} );
Default.args = {
	...defaultArgs,
};
