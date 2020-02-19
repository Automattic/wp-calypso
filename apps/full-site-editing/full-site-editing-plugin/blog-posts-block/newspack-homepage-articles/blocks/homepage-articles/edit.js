/* eslint-disable jsx-a11y/anchor-is-valid */

/**
 * Internal dependencies
 */
import QueryControls from '../../components/query-controls';
import { STORE_NAMESPACE } from './store';
import { isBlogPrivate, isSpecificPostModeActive, queryCriteriaFromAttributes } from './utils';

/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { dateI18n, __experimentalGetSettings } from '@wordpress/date';
import { Component, Fragment, RawHTML } from '@wordpress/element';
import {
	BlockControls,
	InspectorControls,
	PanelColorSettings,
	RichText,
	withColors,
} from '@wordpress/block-editor';
import {
	Button,
	ButtonGroup,
	PanelBody,
	PanelRow,
	RangeControl,
	Toolbar,
	ToggleControl,
	Placeholder,
	Spinner,
	BaseControl,
	Path,
	SVG,
} from '@wordpress/components';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { decodeEntities } from '@wordpress/html-entities';

let IS_SUBTITLE_SUPPORTED_IN_THEME;
if (
	typeof window === 'object' &&
	window.newspackIsPostSubtitleSupported &&
	window.newspackIsPostSubtitleSupported.post_subtitle
) {
	IS_SUBTITLE_SUPPORTED_IN_THEME = true;
}

/* From https://material.io/tools/icons */
const landscapeIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M19 5H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H5V7h14v10z" />
	</SVG>
);

const portraitIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14z" />
	</SVG>
);

const squareIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H6V6h12v12z" />
	</SVG>
);

const uncroppedIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M3 5v4h2V5h4V3H5c-1.1 0-2 .9-2 2zm2 10H3v4c0 1.1.9 2 2 2h4v-2H5v-4zm14 4h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zm0-16h-4v2h4v4h2V5c0-1.1-.9-2-2-2z" />
	</SVG>
);

const coverIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9l-4 5h12l-3-4-2.03 2.71L10 13zm7-4.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5zM20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 18h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z" />
	</SVG>
);

class Edit extends Component {
	renderPost = post => {
		const { attributes } = this.props;
		const {
			showImage,
			imageShape,
			mediaPosition,
			minHeight,
			showCaption,
			showExcerpt,
			showSubtitle,
			showAuthor,
			showAvatar,
			showDate,
			showCategory,
			sectionHeader,
		} = attributes;

		const styles = {
			minHeight:
				mediaPosition === 'behind' &&
				showImage &&
				post.newspack_featured_image_src &&
				minHeight + 'vh',
			paddingTop:
				mediaPosition === 'behind' &&
				showImage &&
				post.newspack_featured_image_src &&
				minHeight / 5 + 'vh',
		};

		const postTitle = this.titleForPost( post );
		const dateFormat = __experimentalGetSettings().formats.date;
		return (
			<article
				className={ post.newspack_featured_image_src ? 'post-has-image' : null }
				key={ post.id }
				style={ styles }
			>
				{ showImage && post.newspack_featured_image_src && (
					<figure className="post-thumbnail" key="thumbnail">
						<a href="#">
							{ imageShape === 'landscape' && (
								<img src={ post.newspack_featured_image_src.landscape } alt="" />
							) }
							{ imageShape === 'portrait' && (
								<img src={ post.newspack_featured_image_src.portrait } alt="" />
							) }
							{ imageShape === 'square' && (
								<img src={ post.newspack_featured_image_src.square } alt="" />
							) }
							{ imageShape === 'uncropped' && (
								<img src={ post.newspack_featured_image_src.uncropped } alt="" />
							) }
						</a>
						{ showCaption && '' !== post.newspack_featured_image_caption && (
							<figcaption>{ post.newspack_featured_image_caption }</figcaption>
						) }
					</figure>
				) }

				<div className="entry-wrapper">
					{ showCategory && post.newspack_category_info.length && (
						<div className="cat-links">
							<a href="#">{ post.newspack_category_info }</a>
						</div>
					) }
					{ RichText.isEmpty( sectionHeader ) ? (
						<h2 className="entry-title" key="title">
							<a href="#">{ postTitle }</a>
						</h2>
					) : (
						<h3 className="entry-title" key="title">
							<a href="#">{ postTitle }</a>
						</h3>
					) }
					{ IS_SUBTITLE_SUPPORTED_IN_THEME && showSubtitle && (
						<RawHTML
							key="subtitle"
							className="newspack-post-subtitle newspack-post-subtitle--in-homepage-block"
						>
							{ post.meta.newspack_post_subtitle || '' }
						</RawHTML>
					) }
					{ showExcerpt && (
						<RawHTML key="excerpt" className="excerpt-contain">
							{ post.excerpt.rendered }
						</RawHTML>
					) }
					<div className="entry-meta">
						{ showAuthor && showAvatar && this.formatAvatars( post.newspack_author_info ) }
						{ showAuthor && this.formatByline( post.newspack_author_info ) }
						{ showDate && (
							<time className="entry-date published" key="pub-date">
								{ dateI18n( dateFormat, post.date_gmt ) }
							</time>
						) }
					</div>
				</div>
			</article>
		);
	};

	titleForPost = post => {
		if ( ! post.title ) {
			return '';
		}
		if ( typeof post.title === 'string' ) {
			return decodeEntities( post.title.trim() );
		}
		if ( typeof post.title === 'object' && post.title.rendered ) {
			return decodeEntities( post.title.rendered.trim() );
		}
	};

	formatAvatars = authorInfo =>
		authorInfo.map( author => (
			<span className="avatar author-avatar" key={ author.id }>
				<a className="url fn n" href="#">
					<RawHTML>{ author.avatar }</RawHTML>
				</a>
			</span>
		) );

	formatByline = authorInfo => (
		<span className="byline">
			{ _x( 'by', 'post author', 'newspack-blocks' ) }{' '}
			{ authorInfo.reduce( ( accumulator, author, index ) => {
				return [
					...accumulator,
					<span className="author vcard" key={ author.id }>
						<a className="url fn n" href="#">
							{ author.display_name }
						</a>
					</span>,
					index < authorInfo.length - 2 && ', ',
					authorInfo.length > 1 &&
						index === authorInfo.length - 2 &&
						_x( ' and ', 'post author', 'newspack-blocks' ),
				];
			}, [] ) }
		</span>
	);

	renderInspectorControls = () => {
		const { attributes, setAttributes, textColor, setTextColor } = this.props;

		const {
			authors,
			specificPosts,
			postsToShow,
			categories,
			columns,
			showImage,
			showCaption,
			imageScale,
			mobileStack,
			minHeight,
			moreButton,
			showExcerpt,
			showSubtitle,
			typeScale,
			showDate,
			showAuthor,
			showAvatar,
			showCategory,
			postLayout,
			mediaPosition,
			specificMode,
			tags,
			tagExclusions,
		} = attributes;

		const imageSizeOptions = [
			{
				value: 1,
				label: /* translators: label for small size option */ __( 'Small', 'newspack-blocks' ),
				shortName: /* translators: abbreviation for small size */ __( 'S', 'newspack-blocks' ),
			},
			{
				value: 2,
				label: /* translators: label for medium size option */ __( 'Medium', 'newspack-blocks' ),
				shortName: /* translators: abbreviation for medium size */ __( 'M', 'newspack-blocks' ),
			},
			{
				value: 3,
				label: /* translators: label for large size option */ __( 'Large', 'newspack-blocks' ),
				shortName: /* translators: abbreviation for large size */ __( 'L', 'newspack-blocks' ),
			},
			{
				value: 4,
				label: /* translators: label for extra large size option */ __(
					'Extra Large',
					'newspack-blocks'
				),
				shortName: /* translators: abbreviation for extra large size */ __(
					'XL',
					'newspack-blocks'
				),
			},
		];

		return (
			<Fragment>
				<PanelBody title={ __( 'Display Settings', 'newspack-blocks' ) } initialOpen={ true }>
					{ postsToShow && (
						<QueryControls
							numberOfItems={ postsToShow }
							onNumberOfItemsChange={ _postsToShow =>
								setAttributes( { postsToShow: _postsToShow } )
							}
							specificMode={ specificMode }
							onSpecificModeChange={ _specificMode =>
								setAttributes( { specificMode: _specificMode } )
							}
							specificPosts={ specificPosts }
							onSpecificPostsChange={ _specificPosts =>
								setAttributes( { specificPosts: _specificPosts } )
							}
							authors={ authors }
							onAuthorsChange={ _authors => setAttributes( { authors: _authors } ) }
							categories={ categories }
							onCategoriesChange={ _categories => setAttributes( { categories: _categories } ) }
							tags={ tags }
							onTagsChange={ _tags => {
								setAttributes( { tags: _tags } );
							} }
							tagExclusions={ tagExclusions }
							onTagExclusionsChange={ _tagExclusions =>
								setAttributes( { tagExclusions: _tagExclusions } )
							}
						/>
					) }
					{ postLayout === 'grid' && (
						<RangeControl
							label={ __( 'Columns', 'newspack-blocks' ) }
							value={ columns }
							onChange={ _columns => setAttributes( { columns: _columns } ) }
							min={ 2 }
							max={ 6 }
							required
						/>
					) }
					{ ! specificMode && ! isBlogPrivate() && (
						/*
						 * Hide the "More" button option on private sites.
						 *
						 * Client-side fetching from a private WP.com blog requires authentication,
						 * which is not provided in the current implementation.
						 * See https://github.com/Automattic/newspack-blocks/issues/306.
						 */
						<ToggleControl
							label={ __( 'Show "More" Button', 'newspack-blocks' ) }
							checked={ moreButton }
							onChange={ () => setAttributes( { moreButton: ! moreButton } ) }
						/>
					) }
				</PanelBody>
				<PanelBody title={ __( 'Featured Image Settings', 'newspack-blocks' ) }>
					<PanelRow>
						<ToggleControl
							label={ __( 'Show Featured Image', 'newspack-blocks' ) }
							checked={ showImage }
							onChange={ () => setAttributes( { showImage: ! showImage } ) }
						/>
					</PanelRow>

					{ showImage && (
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Featured Image Caption', 'newspack-blocks' ) }
								checked={ showCaption }
								onChange={ () => setAttributes( { showCaption: ! showCaption } ) }
							/>
						</PanelRow>
					) }

					{ showImage && mediaPosition !== 'top' && mediaPosition !== 'behind' && (
						<Fragment>
							<PanelRow>
								<ToggleControl
									label={ __( 'Stack on mobile', 'newspack-blocks' ) }
									checked={ mobileStack }
									onChange={ () => setAttributes( { mobileStack: ! mobileStack } ) }
								/>
							</PanelRow>
							<BaseControl
								label={ __( 'Featured Image Size', 'newspack-blocks' ) }
								id="newspackfeatured-image-size"
							>
								<PanelRow>
									<ButtonGroup
										id="newspackfeatured-image-size"
										aria-label={ __( 'Featured Image Size', 'newspack-blocks' ) }
									>
										{ imageSizeOptions.map( option => {
											const isCurrent = imageScale === option.value;
											return (
												<Button
													isLarge
													isPrimary={ isCurrent }
													aria-pressed={ isCurrent }
													aria-label={ option.label }
													key={ option.value }
													onClick={ () => setAttributes( { imageScale: option.value } ) }
												>
													{ option.shortName }
												</Button>
											);
										} ) }
									</ButtonGroup>
								</PanelRow>
							</BaseControl>
						</Fragment>
					) }

					{ showImage && mediaPosition === 'behind' && (
						<RangeControl
							label={ __( 'Minimum height', 'newspack-blocks' ) }
							help={ __(
								"Sets a minimum height for the block, using a percentage of the screen's current height.",
								'newspack-blocks'
							) }
							value={ minHeight }
							onChange={ _minHeight => setAttributes( { minHeight: _minHeight } ) }
							min={ 0 }
							max={ 100 }
							required
						/>
					) }
				</PanelBody>
				<PanelBody title={ __( 'Post Control Settings', 'newspack-blocks' ) }>
					{ IS_SUBTITLE_SUPPORTED_IN_THEME && (
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Subtitle', 'newspack-blocks' ) }
								checked={ showSubtitle }
								onChange={ () => setAttributes( { showSubtitle: ! showSubtitle } ) }
							/>
						</PanelRow>
					) }
					<PanelRow>
						<ToggleControl
							label={ __( 'Show Excerpt', 'newspack-blocks' ) }
							checked={ showExcerpt }
							onChange={ () => setAttributes( { showExcerpt: ! showExcerpt } ) }
						/>
					</PanelRow>
					<RangeControl
						className="type-scale-slider"
						label={ __( 'Type Scale', 'newspack-blocks' ) }
						value={ typeScale }
						onChange={ _typeScale => setAttributes( { typeScale: _typeScale } ) }
						min={ 1 }
						max={ 10 }
						beforeIcon="editor-textcolor"
						afterIcon="editor-textcolor"
						required
					/>
				</PanelBody>
				<PanelColorSettings
					title={ __( 'Color Settings', 'newspack-blocks' ) }
					initialOpen={ true }
					colorSettings={ [
						{
							value: textColor.color,
							onChange: setTextColor,
							label: __( 'Text Color', 'newspack-blocks' ),
						},
					] }
				/>
				<PanelBody title={ __( 'Post Meta Settings', 'newspack-blocks' ) }>
					<PanelRow>
						<ToggleControl
							label={ __( 'Show Date', 'newspack-blocks' ) }
							checked={ showDate }
							onChange={ () => setAttributes( { showDate: ! showDate } ) }
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Show Category', 'newspack-blocks' ) }
							checked={ showCategory }
							onChange={ () => setAttributes( { showCategory: ! showCategory } ) }
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Show Author', 'newspack-blocks' ) }
							checked={ showAuthor }
							onChange={ () => setAttributes( { showAuthor: ! showAuthor } ) }
						/>
					</PanelRow>
					{ showAuthor && (
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Author Avatar', 'newspack-blocks' ) }
								checked={ showAvatar }
								onChange={ () => setAttributes( { showAvatar: ! showAvatar } ) }
							/>
						</PanelRow>
					) }
				</PanelBody>
			</Fragment>
		);
	};

	render() {
		/**
		 * Constants
		 */

		const {
			attributes,
			className,
			clientId,
			setAttributes,
			isSelected,
			latestPosts,
			textColor,
			markPostsAsDisplayed,
		} = this.props;

		const {
			showImage,
			imageShape,
			postLayout,
			mediaPosition,
			moreButton,
			moreButtonText,
			columns,
			typeScale,
			imageScale,
			mobileStack,
			sectionHeader,
			showCaption,
			showCategory,
			specificMode,
		} = attributes;

		const classes = classNames( className, {
			'is-grid': postLayout === 'grid',
			'show-image': showImage,
			[ `columns-${ columns }` ]: postLayout === 'grid',
			[ `ts-${ typeScale }` ]: typeScale !== '5',
			[ `image-align${ mediaPosition }` ]: showImage,
			[ `is-${ imageScale }` ]: imageScale !== '1' && showImage,
			'mobile-stack': mobileStack,
			[ `image-shape${ imageShape }` ]: imageShape !== 'landscape',
			'has-text-color': textColor.color !== '',
			'show-caption': showCaption,
			'show-category': showCategory,
			wpnbha: true,
		} );

		const blockControls = [
			{
				icon: 'list-view',
				title: __( 'List View', 'newspack-blocks' ),
				onClick: () => setAttributes( { postLayout: 'list' } ),
				isActive: postLayout === 'list',
			},
			{
				icon: 'grid-view',
				title: __( 'Grid View', 'newspack-blocks' ),
				onClick: () => setAttributes( { postLayout: 'grid' } ),
				isActive: postLayout === 'grid',
			},
		];

		const blockControlsImages = [
			{
				icon: 'align-none',
				title: __( 'Show media on top', 'newspack-blocks' ),
				isActive: mediaPosition === 'top',
				onClick: () => setAttributes( { mediaPosition: 'top' } ),
			},
			{
				icon: 'align-pull-left',
				title: __( 'Show media on left', 'newspack-blocks' ),
				isActive: mediaPosition === 'left',
				onClick: () => setAttributes( { mediaPosition: 'left' } ),
			},
			{
				icon: 'align-pull-right',
				title: __( 'Show media on right', 'newspack-blocks' ),
				isActive: mediaPosition === 'right',
				onClick: () => setAttributes( { mediaPosition: 'right' } ),
			},
			{
				icon: coverIcon,
				title: __( 'Show media behind', 'newspack-blocks' ),
				isActive: mediaPosition === 'behind',
				onClick: () => setAttributes( { mediaPosition: 'behind' } ),
			},
		];

		const blockControlsImageShape = [
			{
				icon: landscapeIcon,
				title: __( 'Landscape Image Shape', 'newspack-blocks' ),
				isActive: imageShape === 'landscape',
				onClick: () => setAttributes( { imageShape: 'landscape' } ),
			},
			{
				icon: portraitIcon,
				title: __( 'portrait Image Shape', 'newspack-blocks' ),
				isActive: imageShape === 'portrait',
				onClick: () => setAttributes( { imageShape: 'portrait' } ),
			},
			{
				icon: squareIcon,
				title: __( 'Square Image Shape', 'newspack-blocks' ),
				isActive: imageShape === 'square',
				onClick: () => setAttributes( { imageShape: 'square' } ),
			},
			{
				icon: uncroppedIcon,
				title: __( 'Uncropped', 'newspack-blocks' ),
				isActive: imageShape === 'uncropped',
				onClick: () => setAttributes( { imageShape: 'uncropped' } ),
			},
		];

		markPostsAsDisplayed( clientId, latestPosts );
		return (
			<Fragment>
				<div
					className={ classes }
					style={ {
						color: textColor.color,
					} }
				>
					<div>
						{ latestPosts && ( ! RichText.isEmpty( sectionHeader ) || isSelected ) && (
							<RichText
								onChange={ value => setAttributes( { sectionHeader: value } ) }
								placeholder={ __( 'Write header…', 'newspack-blocks' ) }
								value={ sectionHeader }
								tagName="h2"
								className="article-section-title"
							/>
						) }
						{ latestPosts && ! latestPosts.length && (
							<Placeholder>{ __( 'Sorry, no posts were found.', 'newspack-blocks' ) }</Placeholder>
						) }
						{ ! latestPosts && (
							<Placeholder icon={ <Spinner /> } className="component-placeholder__align-center" />
						) }
						{ latestPosts && latestPosts.map( post => this.renderPost( post ) ) }
					</div>
				</div>

				{ ! specificMode && latestPosts && moreButton && ! isBlogPrivate() && (
					/*
					 * The "More" button option is hidden for private sites, so we should
					 * also hide the button in case it was previously enabled.
					 */
					<div className="editor-styles-wrapper wpnbha__wp-block-button__wrapper">
						<div className="wp-block-button">
							<RichText
								placeholder={ __( 'Load more posts', 'newspack-blocks' ) }
								value={ moreButtonText }
								onChange={ value => setAttributes( { moreButtonText: value } ) }
								className="wp-block-button__link"
								keepPlaceholderOnFocus
								allowedFormats={ [] }
							/>
						</div>
					</div>
				) }

				<BlockControls>
					<Toolbar controls={ blockControls } />
					{ showImage && <Toolbar controls={ blockControlsImages } /> }
					{ showImage && <Toolbar controls={ blockControlsImageShape } /> }
				</BlockControls>
				<InspectorControls>{ this.renderInspectorControls() }</InspectorControls>
			</Fragment>
		);
	}
}

export default compose( [
	withColors( { textColor: 'color' } ),
	withSelect( ( select, props ) => {
		const { attributes, clientId } = props;

		const latestPostsQuery = queryCriteriaFromAttributes( attributes );
		if ( ! isSpecificPostModeActive( attributes ) ) {
			const postIdsToExclude = select( STORE_NAMESPACE ).previousPostIds( clientId );
			latestPostsQuery.exclude = postIdsToExclude.join( ',' );
		}

		return {
			latestPosts: select( 'core' ).getEntityRecords( 'postType', 'post', latestPostsQuery ),
		};
	} ),
	withDispatch( ( dispatch, props ) => {
		const { attributes } = props;
		const markPostsAsDisplayed = isSpecificPostModeActive( attributes )
			? dispatch( STORE_NAMESPACE ).markSpecificPostsAsDisplayed
			: dispatch( STORE_NAMESPACE ).markPostsAsDisplayed;

		return {
			markPostsAsDisplayed,
		};
	} ),
] )( Edit );
