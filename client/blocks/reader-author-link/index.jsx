import clsx from 'clsx';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { isAuthorNameBlocked } from 'calypso/reader/lib/author-name-blocklist';
import * as stats from 'calypso/reader/stats';

import './style.scss';

const noop = () => {};

const ReaderAuthorLink = ( { author, post, siteUrl, children, className, onClick } ) => {
	const recordAuthorClick = () => {
		stats.recordAction( 'click_author' );
		stats.recordGaEvent( 'Clicked Author Link' );
		if ( post ) {
			stats.recordTrackForPost( 'calypso_reader_author_link_clicked', post );
		}
		onClick();
	};

	if ( ! siteUrl ) {
		siteUrl = author.URL;
	}

	const authorName = get( author, 'name', null );

	// If the author name is blocked, don't return anything
	if ( ! authorName || isAuthorNameBlocked( authorName ) ) {
		return null;
	}

	const classes = clsx( 'reader-author-link', className );

	// If we have neither author.URL or siteUrl, just return children in a wrapper
	if ( ! siteUrl ) {
		return <span className={ classes }>{ children }</span>;
	}

	return (
		<a className={ classes } href={ siteUrl } onClick={ recordAuthorClick }>
			{ children }
		</a>
	);
};

ReaderAuthorLink.propTypes = {
	author: PropTypes.object.isRequired,
	post: PropTypes.object, // for stats only,
	siteUrl: PropTypes.string, // used instead of author.URL if present
};

ReaderAuthorLink.defaultProps = {
	onClick: noop,
};

export default ReaderAuthorLink;
