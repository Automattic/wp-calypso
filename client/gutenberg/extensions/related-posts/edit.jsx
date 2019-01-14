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

class MockupPostEdit extends Component {
	render() {
		const { displayDate, displayContext, displayThumbnails } = this.props;
		const previewClassName = 'related-posts__preview';

		return (
			<div className={ `${ previewClassName }-post` }>
				{ displayThumbnails && (
					<Button className={ `${ previewClassName }-post-image-mockup` } isLink>
						<span className={ `${ previewClassName }-post-image-mockup-text` }>Featured Image</span>
					</Button>
				) }
				<h4>
					<Button className={ `${ previewClassName }-post-link` } isLink>
						{ __( 'Previews are currently unavailable in the editor' ) }
					</Button>
				</h4>
				{ displayDate && (
					<span className={ `${ previewClassName }-post-date has-small-font-size` }>
						{ __( 'August 3, 2018' ) }
					</span>
				) }
				{ displayContext && (
					<p className={ `${ previewClassName }-post-context` }>{ __( 'In "Uncategorized"' ) }</p>
				) }
			</div>
		);
	}
}

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
		const previewClassName = 'related-posts__preview';

		const displayMockupPosts = posts.length ? false : true;

		const inlineMockupPosts = [];
		for ( let i = 0; i < postsToShow; i++ ) {
			inlineMockupPosts.push(
				<MockupPostEdit
					key={ i.toString() }
					displayThumbnails={ displayThumbnails }
					displayDate={ displayDate }
					displayContext={ displayContext }
				/>
			);
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

				<div
					className={ classNames( className, {
						'is-grid': postLayout === 'grid',
						[ `columns-${ postsToShow }` ]: postLayout === 'grid',
					} ) }
				>
					<div className={ previewClassName }>
						{ displayMockupPosts
							? inlineMockupPosts
							: displayPosts.map( post => (
									<div className={ `${ previewClassName }-post` } key={ post.id }>
										{ displayThumbnails && post.img && post.img.src && (
											<Button className={ `${ previewClassName }-post-link` } isLink>
												<img src={ post.img.src } alt={ post.title } />
											</Button>
										) }
										<h4>
											<Button className={ `${ previewClassName }-post-link` } isLink>
												{ post.title }
											</Button>
										</h4>
										{ displayDate && (
											<span className={ `${ previewClassName }-post-date has-small-font-size` }>
												{ post.date }
											</span>
										) }
										{ displayContext && (
											<p className={ `${ previewClassName }-post-context` }>{ post.context }</p>
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
