/**
 * External Dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { trim, isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import moment from 'moment';

/**
 * Internal Dependencies
 */
import Gravatar from 'components/gravatar';
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
	siteId,
	className = '',
	onSiteClick = () => {},
	followSource,
	lastUpdated,
	translate,
} ) {
	// prefer a users name property
	// if that doesn't exist settle for combining first and last name
	const authorName = siteAuthor.name ||
		trim( `${ siteAuthor.first_name || '' } ${ siteAuthor.last_name || '' }` );
	const readerStreamUrl = getStreamUrl( feedId, siteId );

	return (
		<div className={ classnames( 'reader-subscription-list-item', className ) }>
			<div>
				<a href={ siteUrl } onClick={ onSiteClick }>
					<Gravatar user={ siteAuthor } />
				</a>
			</div>
			<div className="reader-subscription-list-item__byline">
				<span className="reader-subscription-list-item__site-title">{ <a href={ readerStreamUrl }> { siteTitle } </a> }</span>
				{ ! isEmpty( authorName ) &&
					<span>
						<span className="reader-subscription-list-item__by-text">
							{ translate( 'by' ) }
						</span>
						<span><a href={ readerStreamUrl }> { authorName } </a></span>
					</span>
				}
				<div>{ siteExcerpt }</div>
				<div className="reader-subscription-list-item__site-url">
					<a href={ siteUrl }> { stripUrl( siteUrl ) } </a>
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
