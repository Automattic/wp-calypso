/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import { BlockControls, InspectorControls } from '@wordpress/editor';
import { Button, PanelBody, RangeControl, ToggleControl, Toolbar } from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';
import { get } from 'lodash';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { DEFAULT_POSTS, MAX_POSTS_TO_SHOW } from './constants';

class RelatedPostsEdit extends Component {
	render() {
		const { attributes, className, posts, setAttributes } = this.props;
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

		const postsToDisplay = posts.length ? posts : DEFAULT_POSTS;
		const displayPosts = postsToDisplay.slice( 0, postsToShow );

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

				<div
					className={ classNames( `${ className }`, {
						'is-grid': postLayout === 'grid',
						[ `columns-${ postsToShow }` ]: postLayout === 'grid',
					} ) }
				>
					<div className={ `${ className }__preview-items` }>
						{ displayPosts.map( ( post, i ) => (
							<div className={ `${ className }__preview-post` } key={ i }>
								{ displayThumbnails &&
									post.img &&
									post.img.src && (
										<Button className={ `${ className }__preview-post-link` } isLink>
											<img src={ post.img.src } alt={ post.title } />
										</Button>
									) }
								<h4>
									<Button className={ `${ className }__preview-post-link` } isLink>
										{ post.title }
									</Button>
								</h4>
								{ displayDate && (
									<span className={ `${ className }__preview-post-date has-small-font-size` }>
										{ post.date }
									</span>
								) }
								{ displayContext && (
									<p className={ `${ className }__preview-post-context` }>{ post.context }</p>
								) }
							</div>
						) ) }
					</div>
				</div>
			</Fragment>
		);
	}
}

export default withSelect( select => {
	const { getCurrentPost } = select( 'core/editor' );
	const posts = get( getCurrentPost(), 'jetpack-related-posts', [] );

	return {
		posts,
	};
} )( RelatedPostsEdit );
