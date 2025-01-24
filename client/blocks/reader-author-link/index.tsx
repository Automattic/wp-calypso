import clsx from 'clsx';
import React from 'react';
import { isAuthorNameBlocked } from 'calypso/reader/lib/author-name-blocklist';
import * as stats from 'calypso/reader/stats';
import {
	getUserProfileUrl,
	isUserProfileEnabled,
} from 'calypso/reader/user-profile/user-profile.utils';

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
	ID?: number;
	URL?: string;
	name?: string;
	login?: string;
	wpcom_login?: string;
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

	const authorLinkUrl =
		isUserProfileEnabled() && author.wpcom_login
			? getUserProfileUrl( author.wpcom_login )
			: props.siteUrl ?? author.URL;

	const authorName = author.name;
	// If the author name is blocked, don't return anything
	if ( ! authorName || isAuthorNameBlocked( authorName ) ) {
		return null;
	}

	const classes = clsx( 'reader-author-link', className );

	// If we have neither author.URL or siteUrl, just return children in a wrapper
	if ( ! authorLinkUrl ) {
		return <span className={ classes }>{ children }</span>;
	}

	return (
		<a className={ classes } href={ authorLinkUrl } onClick={ recordAuthorClick }>
			{ children }
		</a>
	);
}
