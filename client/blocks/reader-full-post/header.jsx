import { Gridicon, ExternalLink, TimeSince } from '@automattic/components';
import { formatNumberCompact } from '@automattic/number-formatters';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import ReaderSiteStreamLink from 'calypso/blocks/reader-site-stream-link';
import AutoDirection from 'calypso/components/auto-direction';
import { getPostIcon } from 'calypso/reader/get-helpers';
import { recordPermalinkClick } from 'calypso/reader/stats';
import ReaderFullPostHeaderMeta from './header-meta';
import ReaderFullPostHeaderPlaceholder from './placeholders/header';

const ReaderFullPostHeader = ( {
	post,
	layout = 'default',
	author,
	siteName,
	followCount,
	feedId,
	siteId,
	tags,
} ) => {
	const handlePermalinkClick = () => {
		recordPermalinkClick( 'full_post_title', post );
	};

	const recordDateClick = () => {
		recordPermalinkClick( 'timestamp_full_post', post );
	};

	const classes = {
		'reader-full-post__header': true,
		'reader-full-post__header--recent': layout === 'recent',
	};
	if ( ! post.title || post.title.trim().length < 1 ) {
		classes[ 'is-missing-title' ] = true;
	}

	if ( ! post || post._state === 'pending' ) {
		return <ReaderFullPostHeaderPlaceholder />;
	}

	const isDefaultLayout = layout === 'default';
	const iconSrc = getPostIcon( post );
	const displaySiteName = siteName;

	/* eslint-disable react/jsx-no-target-blank */
	return (
		<div className={ clsx( classes ) }>
			{ layout === 'recent' && (
				<div className="reader-full-post__header-site-icon">
					<ReaderSiteStreamLink
						className="reader-full-post__header-site-icon-link"
						feedId={ post.feed_ID }
						siteId={ post.blog_ID }
						post={ post }
					>
						{ iconSrc ? (
							<img
								src={ iconSrc }
								alt={ displaySiteName }
								className="reader-full-post__site-icon"
							/>
						) : (
							<Gridicon
								icon="globe"
								size={ 24 }
								className="reader-full-post__site-icon is-missing-icon"
							/>
						) }
					</ReaderSiteStreamLink>
				</div>
			) }
			{ post.title ? (
				<AutoDirection>
					<h1 className="reader-full-post__header-title">
						<ExternalLink
							className="reader-full-post__header-title-link"
							href={ post.URL }
							target="_blank"
							onClick={ handlePermalinkClick }
						>
							{ post.title }
						</ExternalLink>
					</h1>
				</AutoDirection>
			) : null }
			{ isDefaultLayout && (
				<div className="reader-full-post__header-meta-and-tags">
					<ReaderFullPostHeaderMeta
						post={ post }
						author={ author }
						siteName={ siteName }
						feedId={ feedId }
						siteId={ siteId }
					/>
					{ tags && <div className="reader-full-post__header-tags">{ tags }</div> }
				</div>
			) }
			{ layout === 'recent' && (
				<div className="reader-full-post__header-meta">
					{ displaySiteName && (
						<span className="reader-full-post__header-site-name">
							<ReaderSiteStreamLink
								className="reader-full-post__header-site-name-link"
								feedId={ post.feed_ID }
								siteId={ post.blog_ID }
								post={ post }
							>
								{ displaySiteName }
							</ReaderSiteStreamLink>
						</span>
					) }
					{ followCount && (
						<span className="reader-full-post__header-follow-count">
							{ translate( '%(followCount)s subscriber', '%(followCount)s subscribers', {
								count: followCount,
								args: {
									followCount: formatNumberCompact( followCount ),
								},
							} ) }
						</span>
					) }
					{ post.date && (
						<span className="reader-full-post__header-date">
							<a
								className="reader-full-post__header-date-link"
								onClick={ recordDateClick }
								href={ post.URL }
								target="_blank"
								rel="noopener noreferrer"
							>
								<TimeSince date={ post.date } />
							</a>
						</span>
					) }
				</div>
			) }
		</div>
	);
	/* eslint-enable react/jsx-no-target-blank */
};

ReaderFullPostHeader.propTypes = {
	post: PropTypes.object.isRequired,
	children: PropTypes.node,
	layout: PropTypes.oneOf( [ 'default', 'recent' ] ),
	author: PropTypes.object,
	siteName: PropTypes.string,
	followCount: PropTypes.number,
	feedId: PropTypes.number,
	siteId: PropTypes.number,
	tags: PropTypes.node,
};

export default ReaderFullPostHeader;
