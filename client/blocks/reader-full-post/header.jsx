import clsx from 'clsx';
import PropTypes from 'prop-types';
import TagsList from 'calypso/blocks/reader-post-card/tags-list';
import AutoDirection from 'calypso/components/auto-direction';
import ExternalLink from 'calypso/components/external-link';
import TimeSince from 'calypso/components/time-since';
import { recordPermalinkClick } from 'calypso/reader/stats';
import ReaderFullPostHeaderPlaceholder from './placeholders/header';

const ReaderFullPostHeader = ( { post } ) => {
	const handlePermalinkClick = () => {
		recordPermalinkClick( 'full_post_title', post );
	};

	const recordDateClick = () => {
		recordPermalinkClick( 'timestamp_full_post', post );
	};

	const classes = { 'reader-full-post__header': true };
	if ( ! post.title || post.title.trim().length < 1 ) {
		classes[ 'is-missing-title' ] = true;
	}

	if ( ! post || post._state === 'pending' ) {
		return <ReaderFullPostHeaderPlaceholder />;
	}

	/* eslint-disable react/jsx-no-target-blank */
	return (
		<div className={ clsx( classes ) }>
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
			<div className="reader-full-post__header-meta">
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
			<TagsList post={ post } tagsToShow={ 5 } />
		</div>
	);
	/* eslint-enable react/jsx-no-target-blank */
};

ReaderFullPostHeader.propTypes = {
	post: PropTypes.object.isRequired,
};

export default ReaderFullPostHeader;
