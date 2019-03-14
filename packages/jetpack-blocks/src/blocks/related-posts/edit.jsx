/**
 * External dependencies
 */
import { BlockControls, InspectorControls } from '@wordpress/editor';
import { PanelBody, RangeControl, ToggleControl, Toolbar, Path, SVG } from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';
import { get } from 'lodash';
import { withSelect } from '@wordpress/data';
import { compose, withInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { __ } from '../../utils/i18n';

export const MAX_POSTS_TO_SHOW = 6;

function PlaceholderPostEdit( props ) {
	return (
		<div
			className="jp-related-posts-i2__post"
			id={ props.id }
			aria-labelledby={ props.id + '-heading' }
		>
			<strong id={ props.id + '-heading' } className="jp-related-posts-i2__post-link">
				{ __( "Preview unavailable: you haven't published enough posts with similar content." ) }
			</strong>
			{ props.displayThumbnails && (
				<figure
					className="jp-related-posts-i2__post-image-placeholder"
					aria-label={ __( 'Placeholder image' ) }
				>
					<SVG
						className="jp-related-posts-i2__post-image-placeholder-square"
						xmlns="http://www.w3.org/2000/svg"
						width="100%"
						height="100%"
						viewBox="0 0 350 200"
					>
						<title>{ __( 'Grey square' ) }</title>
						<Path d="M0 0h350v200H0z" fill="#8B8B96" fill-opacity=".1" />
					</SVG>
					<SVG
						className="jp-related-posts-i2__post-image-placeholder-icon"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
					>
						<title>{ __( 'Icon for image' ) }</title>
						<Path fill="none" d="M0 0h24v24H0V0z" />
						<Path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
					</SVG>
				</figure>
			) }

			{ props.displayDate && (
				<div className="jp-related-posts-i2__post-date has-small-font-size">
					{ __( 'August 3, 2018' ) }
				</div>
			) }
			{ props.displayContext && (
				<div className="jp-related-posts-i2__post-context has-small-font-size">
					{ __( 'In “Uncategorized”' ) }
				</div>
			) }
		</div>
	);
}

function RelatedPostsEditItem( props ) {
	return (
		<div
			className="jp-related-posts-i2__post"
			id={ props.id }
			aria-labelledby={ props.id + '-heading' }
		>
			<a
				className="jp-related-posts-i2__post-link"
				id={ props.id + '-heading' }
				href={ props.post.url }
				rel="nofollow noopener noreferrer"
				target="_blank"
			>
				{ props.post.title }
			</a>
			{ props.displayThumbnails && props.post.img && props.post.img.src && (
				<a className="jp-related-posts-i2__post-img-link" href={ props.post.url }>
					<img
						className="jp-related-posts-i2__post-img"
						src={ props.post.img.src }
						alt={ props.post.title }
						rel="nofollow noopener noreferrer"
						target="_blank"
					/>
				</a>
			) }
			{ props.displayDate && (
				<div className="jp-related-posts-i2__post-date has-small-font-size">
					{ props.post.date }
				</div>
			) }
			{ props.displayContext && (
				<div className="jp-related-posts-i2__post-context has-small-font-size">
					{ props.post.context }
				</div>
			) }
		</div>
	);
}

function RelatedPostsPreviewRows( props ) {
	const className = 'jp-related-posts-i2__row';

	let topRowEnd = 0;
	const displayLowerRow = props.posts.length > 3;

	switch ( props.posts.length ) {
		case 2:
		case 4:
		case 5:
			topRowEnd = 2;
			break;
		default:
			topRowEnd = 3;
			break;
	}

	return (
		<div>
			<div className={ className } data-post-count={ props.posts.slice( 0, topRowEnd ).length }>
				{ props.posts.slice( 0, topRowEnd ) }
			</div>
			{ displayLowerRow && (
				<div className={ className } data-post-count={ props.posts.slice( topRowEnd ).length }>
					{ props.posts.slice( topRowEnd ) }
				</div>
			) }
		</div>
	);
}

class RelatedPostsEdit extends Component {
	render() {
		const { attributes, className, posts, setAttributes, instanceId } = this.props;
		const { displayContext, displayDate, displayThumbnails, postLayout, postsToShow } = attributes;

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

		// To prevent the block from crashing, we need to limit ourselves to the
		// posts returned by the backend - so if we want 6 posts, but only 3 are
		// returned, we need to limit ourselves to those 3 and fill in the rest
		// with placeholders.
		//
		// Also, if the site does not have sufficient posts to display related ones
		// (minimum 10 posts), we also use this code block to fill in the
		// placeholders.
		const previewClassName = 'jp-relatedposts-i2';
		const displayPosts = [];
		for ( let i = 0; i < postsToShow; i++ ) {
			if ( posts[ i ] ) {
				displayPosts.push(
					<RelatedPostsEditItem
						id={ `related-posts-${ instanceId }-post-${ i }` }
						key={ previewClassName + '-' + i }
						post={ posts[ i ] }
						displayThumbnails={ displayThumbnails }
						displayDate={ displayDate }
						displayContext={ displayContext }
					/>
				);
			} else {
				displayPosts.push(
					<PlaceholderPostEdit
						id={ `related-posts-${ instanceId }-post-${ i }` }
						key={ 'related-post-placeholder-' + i }
						displayThumbnails={ displayThumbnails }
						displayDate={ displayDate }
						displayContext={ displayContext }
					/>
				);
			}
		}

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Related Posts Settings' ) }>
						<ToggleControl
							label={ __( 'Display thumbnails' ) }
							checked={ displayThumbnails }
							onChange={ value => setAttributes( { displayThumbnails: value } ) }
						/>
						<ToggleControl
							label={ __( 'Display date' ) }
							checked={ displayDate }
							onChange={ value => setAttributes( { displayDate: value } ) }
						/>
						<ToggleControl
							label={ __( 'Display context (category or tag)' ) }
							checked={ displayContext }
							onChange={ value => setAttributes( { displayContext: value } ) }
						/>
						<RangeControl
							label={ __( 'Number of posts' ) }
							value={ postsToShow }
							onChange={ value =>
								setAttributes( { postsToShow: Math.min( value, MAX_POSTS_TO_SHOW ) } )
							}
							min={ 1 }
							max={ MAX_POSTS_TO_SHOW }
						/>
					</PanelBody>
				</InspectorControls>

				<BlockControls>
					<Toolbar controls={ layoutControls } />
				</BlockControls>

				<div className={ className } id={ `related-posts-${ instanceId }` }>
					<div className={ previewClassName } data-layout={ postLayout }>
						<RelatedPostsPreviewRows posts={ displayPosts } />
					</div>
				</div>
			</Fragment>
		);
	}
}

export default compose(
	withInstanceId,
	withSelect( select => {
		const { getCurrentPost } = select( 'core/editor' );
		const posts = get( getCurrentPost(), 'jetpack-related-posts', [] );

		return {
			posts,
		};
	} )
)( RelatedPostsEdit );
