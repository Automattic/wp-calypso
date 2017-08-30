/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { isAuthorNameBlacklisted } from 'reader/lib/author-name-blacklist';
import * as stats from 'reader/stats';
import Emojify from 'components/emojify';

const ReaderAuthorLink = ( { author, post, siteUrl, children, className } ) => {
	const recordAuthorClick = ( {} ) => {
		stats.recordAction( 'click_author' );
		stats.recordGaEvent( 'Clicked Author Link' );
		if ( post ) {
			stats.recordTrackForPost( 'calypso_reader_author_link_clicked', post );
		}
	};

	if ( ! siteUrl ) {
		siteUrl = author.URL;
	}

	const authorName = get( author, 'name', null );

	// If the author name is blacklisted, don't return anything
	if ( ! authorName || isAuthorNameBlacklisted( authorName ) ) {
		return null;
	}

	const classes = classnames( 'reader-author-link', className );

	// If we have neither author.URL or siteUrl, just return children in a wrapper
	if ( ! siteUrl ) {
		return (
			<span className={ classes }>
				<Emojify>
					{ children }
				</Emojify>
			</span>
		);
	}

	return (
		<a className={ classes } href={ siteUrl } onClick={ recordAuthorClick }>
			<Emojify>
				{ children }
			</Emojify>
		</a>
	);
};

ReaderAuthorLink.propTypes = {
	author: React.PropTypes.object.isRequired,
	post: React.PropTypes.object, // for stats only,
	siteUrl: React.PropTypes.string, // used instead of author.URL if present
};

export default ReaderAuthorLink;
