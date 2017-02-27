/**
 * External Dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { trim, isEmpty } from 'lodash';

/**
 * Internal Dependencies
 */
import Gravatar from 'components/gravatar';
import FollowButton from 'reader/follow-button';
import Gridicon from 'gridicons';

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
	className = '',
	onSiteClick = () => {},
	followSource,
	lastUpdated,
} ) {
	const authorName = trim( `${ siteAuthor.first_name || '' } ${ siteAuthor.last_name || '' }` );

	return (
		<div className={ classnames( 'reader-subscription-list-item', className ) }>
			<div>
				<a href={ siteUrl } onClick={ onSiteClick }>
					<Gravatar user={ siteAuthor } />
				</a>
			</div>
			<div className="reader-subscription-list-item__byline">
				<span className="reader-subscription-list-item__site-title">{ <a href={ siteUrl }> { siteTitle } </a> }</span>
				{ ! isEmpty( authorName ) &&
					<span>
						<span className="reader-subscription-list-item__by-text"> by </span>
						<span><a href={ siteUrl }> { authorName } </a></span>
					</span>
				}
				<div>{ siteExcerpt }</div>
				<div className="reader-subscription-list-item__site-url">
					<a href={ siteUrl }> { stripUrl( siteUrl ) } </a> { lastUpdated }
				</div>
			</div>
			<div className="reader-subscription-list-item__options">
				<FollowButton siteUrl={ siteUrl } followSource={ followSource } />
				{ isFollowing && <SettingsMenu /> }
			</div>
		</div>
	);
}

export default ReaderSubscriptionListItem;
