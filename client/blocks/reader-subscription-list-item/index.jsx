/**
 * External Dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */
import Gravatar from 'components/gravatar';
import FollowButton from 'reader/follow-button';

function SettingsMenu() {
	return <p>"Hi I'm a settings icon that works!!!" </p>;
}

function ReaderSubscriptionListItem( {
	isFollowing,
	siteUrl,
	siteTitle,
	siteAuthorUsername,
	siteAuthorName,
	siteExcerpt,
	className = '',
	onSiteClick = () => {},
	followSource = 'reader-subscriptions-list-item',
} ) {
	return (
		<div className={ classnames( 'reader-subscriptions-list-item', className ) }>
			<a href={ siteUrl } onClick={ onSiteClick }>
				<Gravatar user={ siteAuthorUsername } />
			</a>
			<span>{ <a href={ siteUrl }> { siteTitle } </a> }</span> by <span>{ siteAuthorName }</span>
			<p>{ siteExcerpt }</p>
			<FollowButton siteUrl={ siteUrl } followSource={ followSource } />
			{ isFollowing && <SettingsMenu /> }
		</div>
	);
}

export default ReaderSubscriptionListItem;
