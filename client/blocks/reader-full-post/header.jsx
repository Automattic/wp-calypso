import { Gridicon } from '@automattic/components';
import formatNumber from '@automattic/components/src/number-formatters/lib/format-number';
import clsx from 'clsx';
import { translate, getLocaleSlug } from 'i18n-calypso';
import PropTypes from 'prop-types';
import TagsList from 'calypso/blocks/reader-post-card/tags-list';
import ReaderSiteStreamLink from 'calypso/blocks/reader-site-stream-link';
import AutoDirection from 'calypso/components/auto-direction';
import ExternalLink from 'calypso/components/external-link';
import TimeSince from 'calypso/components/time-since';
import { recordPermalinkClick } from 'calypso/reader/stats';
import ReaderFullPostHeaderPlaceholder from './placeholders/header';

const ReaderFullPostHeader = ( { post, authorProfile, layout } ) => {
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

	// Rather than pass in additional props for the `recent` layout, we extract the props we need from authorProfile.
	const { props: { author, siteIcon, feedIcon, siteName, followCount } = {} } = authorProfile || {};

	const isDefaultLayout = layout === 'default';
	const iconSrc = author?.avatar_URL || siteIcon || feedIcon;

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
							<img src={ iconSrc } alt={ siteName } className="reader-full-post__site-icon" />
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
							icon={ false }
							onClick={ handlePermalinkClick }
						>
							{ post.title }
						</ExternalLink>
					</h1>
				</AutoDirection>
			) : null }
			{ isDefaultLayout && <div className="reader-full-post__author-block">{ authorProfile }</div> }
			<div className="reader-full-post__header-meta">
				{ layout === 'recent' && (
					<>
						{ siteName && (
							<span className="reader-full-post__header-site-name">
								<ReaderSiteStreamLink
									className="reader-full-post__header-site-name-link"
									feedId={ post.feed_ID }
									siteId={ post.blog_ID }
									post={ post }
								>
									{ siteName }
								</ReaderSiteStreamLink>
							</span>
						) }
						{ followCount && (
							<span className="reader-full-post__header-follow-count">
								{ translate( '%(followCount)s subscriber', '%(followCount)s subscribers', {
									count: followCount,
									args: {
										followCount: formatNumber( followCount, getLocaleSlug() ),
									},
								} ) }
							</span>
						) }
					</>
				) }
				{ post.date ? (
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
				) : null }
			</div>
			{ isDefaultLayout && <TagsList post={ post } tagsToShow={ 5 } /> }
		</div>
	);
	/* eslint-enable react/jsx-no-target-blank */
};

ReaderFullPostHeader.propTypes = {
	post: PropTypes.object.isRequired,
	children: PropTypes.node,
	layout: PropTypes.oneOf( [ 'default', 'recent' ] ),
};

ReaderFullPostHeader.defaultProps = {
	layout: 'default',
};

export default ReaderFullPostHeader;
