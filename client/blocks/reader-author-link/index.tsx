import clsx from 'clsx';
import React from 'react';
import { isAuthorNameBlocked } from 'calypso/reader/lib/author-name-blocklist';
import * as stats from 'calypso/reader/stats';

import './style.scss';

interface ReaderAuthorLinkProps {
	author: ReaderLinkAuthor;
	children?: React.ReactNode;
	className?: string;
	onClick?: () => void;
	post?: object; // for stats only,
	siteUrl?: string; // used instead of author.URL if present
}

export interface ReaderLinkAuthor {
	URL?: string;
	name?: string;
}

/**
 * A link to a author's external site for a given post.
 *
 * This component does not dictate the content of the link, only the href and click behavior.
 */
export default function ReaderAuthorLink( props: ReaderAuthorLinkProps ) {
	const { author, post, children, className, onClick } = props;
	const recordAuthorClick = () => {
		stats.recordAction( 'click_author' );
		stats.recordGaEvent( 'Clicked Author Link' );
		if ( post ) {
			stats.recordTrackForPost( 'calypso_reader_author_link_clicked', post );
		}
		onClick?.();
	};

	let siteUrl = props.siteUrl;
	if ( ! siteUrl ) {
		siteUrl = author.URL;
	}

	const authorName = author.name;

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
}
