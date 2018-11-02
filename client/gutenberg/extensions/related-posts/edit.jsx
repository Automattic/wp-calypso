/** @format */

/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import classNames from 'classnames';
import { Component, Fragment } from '@wordpress/element';
import { BlockAlignmentToolbar, BlockControls, InspectorControls } from '@wordpress/editor';
import { Button, PanelBody, RangeControl, ToggleControl, Toolbar } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { ALIGNMENT_OPTIONS, DEFAULT_POSTS, MAX_POSTS_TO_SHOW } from './constants';

class RelatedPostsEdit extends Component {
	state = {
		posts: [],
		fetchingPosts: false,
	};

	componentDidMount() {
		this.fetchPosts();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.isSaving && ! this.props.isSaving ) {
			this.fetchPosts();
		}
	}

	fetchPosts() {
		const { postId } = this.props;
		const { fetchingPosts } = this.state;

		if ( ! postId || fetchingPosts ) {
			return;
		}

		this.setState( {
			fetchingPosts: true,
		} );

		apiFetch( {
			path: '/jetpack/v4/site/posts/related?http_envelope=1&post_id=' + postId,
		} )
			.then( response => {
				this.setState( {
					posts: response.posts,
					fetchingPosts: false,
				} );
			} )
			.catch( () => {
				this.setState( {
					fetchingPosts: false,
				} );
			} );
	}

	render() {
		const { attributes, className, setAttributes } = this.props;
		const { posts } = this.state;
		const {
			align,
			displayContext,
			displayDate,
			displayThumbnails,
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
					<BlockAlignmentToolbar
						value={ align }
						onChange={ nextAlign => {
							setAttributes( { align: nextAlign } );
						} }
						controls={ ALIGNMENT_OPTIONS }
					/>
					<Toolbar controls={ layoutControls } />
				</BlockControls>

				<div
					className={ classNames( `${ className }`, {
						'is-grid': postLayout === 'grid',
						[ `columns-${ postsToShow }` ]: postLayout === 'grid',
						[ `align${ align }` ]: align,
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
	const { getCurrentPostId, isSavingPost } = select( 'core/editor' );

	return {
		isSaving: !! isSavingPost(),
		postId: getCurrentPostId(),
	};
} )( RelatedPostsEdit );
