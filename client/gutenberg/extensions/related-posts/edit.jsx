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

/**
 * Internal dependencies
 */
import { DEFAULT_POSTS, MAX_POSTS_TO_SHOW } from './constants';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export default ( { attributes, setAttributes } ) => {
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
		DEFAULT_POSTS.length > postsToShow ? DEFAULT_POSTS.slice( 0, postsToShow ) : DEFAULT_POSTS;

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
};
/* eslint-enable wpcalypso/jsx-classname-namespace */
