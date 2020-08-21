/* eslint-disable jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content, jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */

/**
 * External dependencies
 */
import { isEqual, isUndefined, pickBy } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { dateI18n, __experimentalGetSettings } from '@wordpress/date';
import { Component, createRef, Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/editor';
import {
	PanelBody,
	PanelRow,
	Placeholder,
	RangeControl,
	Spinner,
	ToggleControl,
} from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies
 */
import QueryControls from '../../components/query-controls';
import createSwiper from './create-swiper';
import { formatAvatars, formatByline } from '../../shared/js/utils';

class Edit extends Component {
	constructor( props ) {
		super( props );

		this.btnPlayRef = createRef();
		this.btnPauseRef = createRef();
		this.btnNextRef = createRef();
		this.btnPrevRef = createRef();
		this.carouselRef = createRef();
		this.paginationRef = createRef();
	}

	componentDidMount() {
		this.initializeSwiper( 0 );
	}

	componentDidUpdate( prevProps ) {
		const { attributes, latestPosts } = this.props;

		if (
			prevProps.latestPosts !== latestPosts ||
			( prevProps.latestPosts &&
				latestPosts &&
				prevProps.latestPosts.length !== latestPosts.length ) ||
			! isEqual( prevProps.attributes, attributes )
		) {
			let initialSlide = 0;

			if ( this.swiperInstance ) {
				if ( latestPosts && this.swiperInstance.realIndex < latestPosts.length ) {
					initialSlide = this.swiperInstance.realIndex;
				}
				this.swiperInstance.destroy( true, true );
			}

			this.initializeSwiper( initialSlide );
		}
	}

	initializeSwiper( initialSlide ) {
		const { latestPosts } = this.props;

		if ( latestPosts && latestPosts.length ) {
			const { autoplay, delay } = this.props.attributes;

			this.swiperInstance = createSwiper(
				{
					block: this.carouselRef.current, // Editor uses the same wrapper for block and swiper container.
					container: this.carouselRef.current,
					next: this.btnNextRef.current,
					prev: this.btnPrevRef.current,
					play: this.btnPlayRef.current,
					pause: this.btnPauseRef.current,
					pagination: this.paginationRef.current,
				},
				{
					autoplay,
					delay: delay * 1000,
					initialSlide,
				}
			);
		}
	}

	render() {
		const { attributes, className, setAttributes, latestPosts } = this.props;
		const {
			authors,
			autoplay,
			categories,
			delay,
			postsToShow,
			showCategory,
			showDate,
			showAuthor,
			showAvatar,
			tags,
		} = attributes;
		const classes = classnames(
			className,
			'wp-block-newspack-blocks-carousel', // Default to make styles work for third-party consumers.
			'swiper-container',
			autoplay && 'wp-block-newspack-blocks-carousel__autoplay-playing'
		);
		const dateFormat = __experimentalGetSettings().formats.date;
		return (
			<Fragment>
				<div className={ classes } ref={ this.carouselRef }>
					{ latestPosts && ! latestPosts.length && (
						<Placeholder>{ __( 'Sorry, no posts were found.', 'full-site-editing' ) }</Placeholder>
					) }
					{ ! latestPosts && (
						<Placeholder icon={ <Spinner /> } className="component-placeholder__align-center" />
					) }
					{ latestPosts && (
						<Fragment>
							{ autoplay && (
								<Fragment>
									<button
										className="amp-carousel-button-pause amp-carousel-button"
										ref={ this.btnPauseRef }
									/>
									<button
										className="amp-carousel-button-play amp-carousel-button"
										ref={ this.btnPlayRef }
									/>
								</Fragment>
							) }
							<div className="swiper-wrapper">
								{ latestPosts.map(
									( post ) =>
										post.newspack_featured_image_src && (
											<article className="post-has-image swiper-slide" key={ post.id }>
												<figure className="post-thumbnail">
													{ post.newspack_featured_image_src && (
														<a href="#" rel="bookmark">
															<img src={ post.newspack_featured_image_src.large } alt="" />
														</a>
													) }
												</figure>
												<div className="entry-wrapper">
													{ showCategory && post.newspack_category_info.length && (
														<div className="cat-links">
															<a href="#">{ decodeEntities( post.newspack_category_info ) }</a>
														</div>
													) }
													<h3 className="entry-title">
														<a href="#">{ decodeEntities( post.title.rendered.trim() ) }</a>
													</h3>
													<div className="entry-meta">
														{ showAuthor &&
															showAvatar &&
															formatAvatars( post.newspack_author_info ) }
														{ showAuthor && formatByline( post.newspack_author_info ) }
														{ showDate && (
															<time className="entry-date published" key="pub-date">
																{ dateI18n( dateFormat, post.date_gmt ) }
															</time>
														) }
													</div>
												</div>
											</article>
										)
								) }
							</div>
							<button
								className="amp-carousel-button amp-carousel-button-prev swiper-button-prev"
								ref={ this.btnPrevRef }
							/>
							<button
								className="amp-carousel-button amp-carousel-button-next swiper-button-next"
								ref={ this.btnNextRef }
							/>
							<div
								className="swiper-pagination-bullets amp-pagination"
								ref={ this.paginationRef }
							/>
						</Fragment>
					) }
				</div>
				<InspectorControls>
					<PanelBody title={ __( 'Display Settings', 'full-site-editing' ) } initialOpen={ true }>
						{ postsToShow && (
							<QueryControls
								enableSpecific={ false }
								numberOfItems={ postsToShow }
								onNumberOfItemsChange={ ( value ) =>
									setAttributes( { postsToShow: value ? value : 1 } )
								}
								authors={ authors }
								onAuthorsChange={ ( value ) => setAttributes( { authors: value } ) }
								categories={ categories }
								onCategoriesChange={ ( value ) => setAttributes( { categories: value } ) }
								tags={ tags }
								onTagsChange={ ( value ) => setAttributes( { tags: value } ) }
							/>
						) }
					</PanelBody>
					<PanelBody title={ __( 'Slideshow Settings', 'full-site-editing' ) } initialOpen={ true }>
						<ToggleControl
							label={ __( 'Autoplay', 'full-site-editing' ) }
							help={ __( 'Autoplay between slides', 'full-site-editing' ) }
							checked={ autoplay }
							onChange={ ( _autoplay ) => {
								setAttributes( { autoplay: _autoplay } );
							} }
						/>
						{ autoplay && (
							<RangeControl
								label={ __( 'Delay between transitions (in seconds)', 'full-site-editing' ) }
								value={ delay }
								onChange={ ( _delay ) => {
									setAttributes( { delay: _delay } );
								} }
								min={ 1 }
								max={ 20 }
							/>
						) }
					</PanelBody>
					<PanelBody title={ __( 'Article Meta Settings', 'full-site-editing' ) }>
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Date', 'full-site-editing' ) }
								checked={ showDate }
								onChange={ () => setAttributes( { showDate: ! showDate } ) }
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Category', 'full-site-editing' ) }
								checked={ showCategory }
								onChange={ () => setAttributes( { showCategory: ! showCategory } ) }
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Author', 'full-site-editing' ) }
								checked={ showAuthor }
								onChange={ () => setAttributes( { showAuthor: ! showAuthor } ) }
							/>
						</PanelRow>
						{ showAuthor && (
							<PanelRow>
								<ToggleControl
									label={ __( 'Show Author Avatar', 'full-site-editing' ) }
									checked={ showAvatar }
									onChange={ () => setAttributes( { showAvatar: ! showAvatar } ) }
								/>
							</PanelRow>
						) }
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	}
}

export default compose( [
	withSelect( ( select, props ) => {
		const { postsToShow, authors, categories, tags } = props.attributes;
		const { getEntityRecords } = select( 'core' );
		const latestPostsQuery = pickBy(
			{
				per_page: postsToShow,
				categories,
				author: authors,
				tags,
				meta_key: '_thumbnail_id',
				meta_value_num: 0,
				meta_compare: '>',
			},
			( value ) => ! isUndefined( value )
		);
		return {
			latestPosts: getEntityRecords( 'postType', 'post', latestPostsQuery ),
		};
	} ),
] )( Edit );
