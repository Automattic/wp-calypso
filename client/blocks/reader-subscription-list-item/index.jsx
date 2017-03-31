/**
 * External Dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { trim, isEmpty, get } from 'lodash';
import { localize } from 'i18n-calypso';
import moment from 'moment';

/**
 * Internal Dependencies
 */
import ReaderAvatar from 'blocks/reader-avatar';
import FollowButton from 'reader/follow-button';
import Gridicon from 'gridicons';
import { getStreamUrl } from 'reader/route';

const stripUrl = url => url.replace( 'https://', '' ).replace( 'http://', '' ).replace( '/', '' );

function SettingsMenu() {
	return (
		<span className="reader-subscription-list-item__settings-menu">
			<Gridicon
				icon="cog"
				size={ 20 }
			/>
			Settings
		</span>
	);
}

function ReaderSubscriptionListItem( {
	isFollowing,
	siteUrl,
	siteTitle,
	siteAuthor,
	siteExcerpt,
	feedId,
	feed,
	siteId,
	site,
	className = '',
	followSource,
	lastUpdated,
	translate,
} ) {
	// prefer a users name property
	// if that doesn't exist settle for combining first and last name
	const authorName = siteAuthor && ( siteAuthor.name ||
		trim( `${ siteAuthor.first_name || '' } ${ siteAuthor.last_name || '' }` ) );
	const siteIcon = get( site, 'icon.img' );
	const feedIcon = get( feed, 'image' );
	const streamUrl = getStreamUrl( feedId, siteId );

	return (
		<div className={ classnames( 'reader-subscription-list-item', className ) }>
			<div>
				<ReaderAvatar
					siteIcon={ siteIcon }
					feedIcon={ feedIcon }
					author={ siteAuthor }
					preferGravatar={ true }
					siteUrl={ streamUrl }
					isCompact={ true }
				/>
			</div>
			<div className="reader-subscription-list-item__byline">
				<span className="reader-subscription-list-item__site-title">{ <a href={ streamUrl }> { siteTitle } </a> }</span>
				{ ! isEmpty( authorName ) &&
					<span>
						<span className="reader-subscription-list-item__by-text">
							{ translate( 'by' ) }
						</span>
						<span><a href={ streamUrl }> { authorName } </a></span>
					</span>
				}
				<div>{ siteExcerpt }</div>
				<div className="reader-subscription-list-item__site-url">
					<a href={ siteUrl }> { siteUrl && stripUrl( siteUrl ) } </a>
					{ moment( lastUpdated ).fromNow() }
				</div>
			</div>
			<div className="reader-subscription-list-item__options">
				<FollowButton siteUrl={ siteUrl } followSource={ followSource } />
				{ isFollowing && <SettingsMenu /> }
			</div>
		</div>
	);
}

export default localize( ReaderSubscriptionListItem );
