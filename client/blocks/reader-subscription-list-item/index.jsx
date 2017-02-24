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
	followSource = 'reader-subscriptions-list-item',
} ) {
	const authorName = trim( `${ siteAuthor.first_name || '' } ${ siteAuthor.last_name || '' }` );
	return (
		<div className={ classnames( 'reader-subscription-list-item', className ) }>
			<a href={ siteUrl } onClick={ onSiteClick }>
				<Gravatar user={ siteAuthor } />
			</a>
			<span>{ <a href={ siteUrl }> { siteTitle } </a> }</span>
			{ ! isEmpty( authorName ) &&
				<span>
					<span className="reader-subscription-list-item__by-text"> by </span>
					<span><a href={ siteUrl }> { authorName } </a></span>
				</span>
			}
			<FollowButton siteUrl={ siteUrl } followSource={ followSource } />
			{ isFollowing && <SettingsMenu /> }
			<p>{ siteExcerpt }</p>
		</div>
	);
}

export default ReaderSubscriptionListItem;
