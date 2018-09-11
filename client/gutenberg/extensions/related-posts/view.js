/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import { __ } from '@wordpress/i18n';
import { Fragment } from '@wordpress/element';
import { BlockControls, InspectorControls } from '@wordpress/editor';
import {
	Button,
	Dashicon,
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
	Toolbar,
} from '@wordpress/components';
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';

/**
 * Module variables
 */
const MAX_POSTS_TO_SHOW = 3;
const examplePosts = [
	{
		title: 'Big iPhone/iPad Update Now Available',
		icon: 'tablet',
		date: 'August 3, 2018',
		context: 'In "Mobile"',
	},
	{
		title: 'The WordPress for Android App Gets a Big Facelift',
		icon: 'smartphone',
		date: 'August 2, 2018',
		context: 'In "Mobile"',
	},
	{
		title: 'Upgrade Focus: VideoPress For Weddings',
		icon: 'video-alt2',
		date: 'August 5, 2018',
		context: 'In "Upgrade"',
	},
];

registerBlockType( 'jetpack/related-posts', {
	title: 'Related Posts',

	icon: 'admin-page',

	category: 'layout',

	attributes: {
		postLayout: {
			type: 'string',
			default: 'grid',
		},
		headline: {
			type: 'string',
			default: __( 'Related' ),
		},
		displayDate: {
			type: 'boolean',
			default: true,
		},
		displayThumbnails: {
			type: 'boolean',
			default: false,
		},
		displayContext: {
			type: 'boolean',
			default: true,
		},
		postsToShow: {
			type: 'number',
			default: 3,
		},
	},

	edit: ( { attributes, setAttributes } ) => {
		const {
			displayContext,
			displayDate,
			displayThumbnails,
			headline,
			postLayout,
			postsToShow,
		} = attributes;

		const layoutControls = [
			{
				icon: 'grid-view',
				title: __( 'Grid View' ),
				onClick: () => setAttributes( { postLayout: 'grid' } ),
				isActive: postLayout === 'grid',
			},
			{
				icon: 'list-view',
				title: __( 'List View' ),
				onClick: () => setAttributes( { postLayout: 'list' } ),
				isActive: postLayout === 'list',
			},
		];

		const displayPosts =
			examplePosts.length > postsToShow ? examplePosts.slice( 0, postsToShow ) : examplePosts;

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Related Posts Settings' ) }>
						<TextControl
							label={ __( 'Headline' ) }
							value={ headline }
							onChange={ value => setAttributes( { headline: value } ) }
						/>
						<ToggleControl
							label={ __( 'Display date' ) }
							checked={ displayDate }
							onChange={ value => setAttributes( { displayDate: value } ) }
						/>
						<ToggleControl
							label={ __( 'Display thumbnails' ) }
							checked={ displayThumbnails }
							onChange={ value => setAttributes( { displayThumbnails: value } ) }
						/>
						<ToggleControl
							label={ __( 'Display context (category or tag)' ) }
							checked={ displayContext }
							onChange={ value => setAttributes( { displayContext: value } ) }
						/>
						<RangeControl
							label={ __( 'Number of posts' ) }
							value={ postsToShow }
							onChange={ value => setAttributes( { postsToShow: value } ) }
							min={ 1 }
							max={ MAX_POSTS_TO_SHOW }
						/>
					</PanelBody>
				</InspectorControls>
				<BlockControls>
					<Toolbar controls={ layoutControls } />
				</BlockControls>

				<div className="related-posts">
					<div className="related-posts__preview">
						{ headline.length && <h3 className="related-posts__preview-headline">{ headline }</h3> }

						<div
							className={ classNames( 'related-posts__preview-items', {
								'is-grid': postLayout === 'grid',
								[ `columns-${ postsToShow }` ]: postLayout === 'grid',
							} ) }
						>
							{ displayPosts.map( ( post, i ) => (
								<div class="related-posts__preview-post" key={ i }>
									{ displayThumbnails && (
										<Button className="related-posts__preview-post-link" isLink>
											<Dashicon icon={ post.icon } size="128" />
										</Button>
									) }
									<h4 className="related-posts__preview-post-title">
										<Button className="related-posts__preview-post-link" isLink>
											{ post.title }
										</Button>
									</h4>
									{ displayDate && (
										<span className="related-posts__preview-post-date">{ post.date }</span>
									) }
									{ displayContext && (
										<p className="related-posts__preview-post-context">{ post.context }</p>
									) }
								</div>
							) ) }
						</div>
					</div>
				</div>
			</Fragment>
		);
	},
	save: () => null,
} );
