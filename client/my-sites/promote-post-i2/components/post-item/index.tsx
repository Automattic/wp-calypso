import config from '@automattic/calypso-config';
import { safeImageUrl } from '@automattic/calypso-url';
import './style.scss';
import { Button } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { translate } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import { BlazablePost } from 'calypso/data/promote-post/types';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import useOpenPromoteWidget from '../../hooks/use-open-promote-widget';
import { formatNumber, getShortDateString, getPostType } from '../../utils';

export default function PostItem( {
	post,
	filterType,
	hasPaymentsBlocked,
}: {
	post: BlazablePost;
	filterType: string;
	hasPaymentsBlocked: boolean;
} ) {
	const onClickPromote = useOpenPromoteWidget( {
		keyValue: 'post-' + post.ID,
		entrypoint: 'promoted_posts-post_item',
	} );

	// API can return "false" as a featured image URL
	const safeUrl = 'string' === typeof post?.featured_image && safeImageUrl( post.featured_image );
	const featuredImage = safeUrl && resizeImageUrl( safeUrl, 108, 0 );
	const isRunningInWooStore = config.isEnabled( 'is_running_in_woo_site' );

	const postDate = post?.date ? getShortDateString( post.date, true ) : '-';

	const viewCount = post?.monthly_view_count ?? 0;
	const likeCount = post?.like_count ?? 0;
	const commentCount = post?.comment_count ?? 0;
	const productPrice = post?.price || '-';
	const isWooProduct = isRunningInWooStore && filterType === 'product';

	const mobileStatsSeparator = <span className="blazepress-mobile-stats-mid-dot">&#183;</span>;
	const titleIsLong = post?.title.length > 35;
	const titleShortened = titleIsLong ? post?.title.slice( 0, 35 ) + '...' : post?.title;

	return (
		<tr className="post-item__row">
			<td className="post-item__post-data">
				<div className="post-item__post-data-row">
					{ featuredImage && (
						<div className="post-item__post-thumbnail-wrapper">
							<img
								src={ featuredImage }
								alt={ translate( 'For %(postType)s %(name)s', {
									args: {
										postType: getPostType( post.type ),
										name: post?.title,
									},
								} ).toString() }
							/>
							<img src={ featuredImage } alt="For " />
						</div>
					) }
					{ ! featuredImage && (
						<div className="post-item__post-thumbnail-wrapper post-item__post-thumbnail-wrapper_no-image">
							<svg // "No image found" icon
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M17.5576 5.4415L16.4996 4.38344L15.4415 5.4415L14.5576 4.55762L15.6157 3.49956L14.5576 2.4415L15.4415 1.55762L16.4996
									2.61568L17.5576 1.55762L18.4415 2.4415L17.3834 3.49956L18.4415 4.55762L17.5576 5.4415ZM17.5 15.8333V6.85506C17.1831 6.94936 16.8475 7 16.5 7C16.4159 7 16.3326 6.99704
									16.25 6.99121V11.1306L13.769 8.71854C13.5264 8.48271 13.1402 8.48271 12.8976 8.71854L9.92167 11.6119L7.48278 10.0311C7.26548 9.89025 6.98384 9.89799 6.77461 10.0506L3.75
									12.256L3.75 4.16667C3.75 3.93655 3.93655 3.75 4.16667 3.75L13.0088 3.75C13.003 3.66742 13 3.58406 13 3.5C13 3.15251 13.0506 2.81685 13.1449 2.5L4.16667 2.5C3.24619 2.5 2.5
									3.24619 2.5 4.16667L2.5 15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333ZM3.75 13.803V15.8333C3.75 16.0635 3.93655 16.25
									4.16667 16.25H15.8333C16.0635 16.25 16.25 16.0635 16.25 15.8333V12.836L16.231 12.8555L13.3333 10.0384L10.4357 12.8555C10.2266 13.0588 9.90474 13.0905 9.66005
									12.9319L7.16369 11.3139L3.75 13.803Z"
									fill="#8C8F94"
								/>
							</svg>
						</div>
					) }
					<div className="post-item__post-title">
						<div className="post-item__post-subheading-mobile">
							{ isWooProduct ? (
								<>
									{ post.sku
										? sprintf(
												/* translators: %s its an unique alphanumeric code for a product */
												__( 'SKU: %s' ),
												post.sku
										  )
										: '-' }
								</>
							) : (
								<>
									{ sprintf(
										// translators: %s is number of post's likes
										_n( '%s like', '%s likes', likeCount ),
										formatNumber( likeCount, true )
									) }
									{ mobileStatsSeparator }
									{ sprintf(
										// translators: %s is number of post's comments
										_n( '%s comment', '%s comments', commentCount ),
										formatNumber( commentCount, true )
									) }
								</>
							) }
						</div>
						<div className="post-item__post-title-content">
							<span>{ titleShortened || __( 'Untitled' ) }</span>
							{ titleIsLong && (
								<InfoPopover position="bottom right">
									{ __( 'Title:' ) }
									<br />
									<span className="popover-title">{ post?.title }</span>
								</InfoPopover>
							) }
						</div>
						<div className="post-item__post-subtitle-mobile">
							{ isWooProduct ? productPrice : getPostType( post.type ) }
							{ mobileStatsSeparator }
							{ sprintf(
								/* translators: %s the post's published date */
								__( 'Published: %s' ),
								postDate
							) }
						</div>
					</div>
				</div>
				<div className="post-item__post-data-row post-item__post-data-row-mobile">
					<div className="post-item__stats-mobile">
						{ sprintf(
							// translators: %s is number of post's visitors
							_n( '%s visitor', '%s visitors', viewCount ),
							formatNumber( viewCount, true )
						) }
						<div className="post-item__actions-mobile">
							<a
								href={ post.post_url }
								className="post-item__view-button"
								target="_blank"
								rel="noreferrer"
							>
								<span aria-hidden="true">{ __( 'View' ) }</span>
								<span className="sr-only">
									{ translate( 'View %(postType)s %(name)s', {
										args: {
											postType: getPostType( post.type ),
											name: post?.title,
										},
									} ) }
								</span>
							</a>
							<Button
								isBusy={ false }
								disabled={ hasPaymentsBlocked }
								onClick={ onClickPromote }
								className="post-item__post-promote-button-mobile"
							>
								<span aria-hidden="true">{ __( 'Promote' ) }</span>
								<span className="sr-only">
									{ translate( 'Promote %(postType)s %(name)s', {
										args: {
											postType: getPostType( post.type ),
											name: post?.title,
										},
									} ) }
								</span>
							</Button>
						</div>
					</div>
				</div>
			</td>

			<td className="post-item__post-type">{ getPostType( post.type ) }</td>
			{ isWooProduct && (
				<>
					<td className="post-item__post-sku">{ post.sku || '-' }</td>
					<td className="post-item__post-price">{ post.price || '-' }</td>
				</>
			) }
			<td className="post-item__post-publish-date">{ postDate }</td>
			<td className="post-item__post-views">{ formatNumber( viewCount, true ) }</td>
			{ ! isWooProduct && (
				<>
					<td className="post-item__post-likes">{ formatNumber( likeCount, true ) }</td>
					<td className="post-item__post-comments">{ formatNumber( commentCount, true ) }</td>
				</>
			) }
			<td className="post-item__post-view">
				<a href={ post.post_url } className="post-item__view-link" target="_blank" rel="noreferrer">
					<span aria-hidden="true">{ __( 'View' ) }</span>
					<span className="sr-only">
						{ translate( 'View %(postType)s %(name)s', {
							args: {
								postType: getPostType( post.type ),
								name: post?.title,
							},
						} ) }
					</span>
				</a>
			</td>
			<td className="post-item__post-promote">
				<Button
					isBusy={ false }
					disabled={ hasPaymentsBlocked }
					onClick={ onClickPromote }
					className="post-item__post-promote-button"
				>
					<span aria-hidden="true">{ __( 'Promote' ) }</span>
					<span className="sr-only">
						{ translate( 'Promote %(postType)s %(name)s', {
							args: {
								postType: getPostType( post.type ),
								name: post?.title,
							},
						} ) }
					</span>
				</Button>
			</td>
		</tr>
	);
}
