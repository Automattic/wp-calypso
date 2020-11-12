/**
 * External dependencies
 */
import React from 'react';
import createReactClass from 'create-react-class';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
/* eslint-disable no-restricted-imports */
import observe from 'calypso/lib/mixins/data-observe';
/* eslint-enable no-restricted-imports */
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import Gridicon from 'calypso/components/gridicon';

const debug = debugFactory( 'calypso:stats:action-follow' );

const StatsActionFollow = createReactClass( {
	displayName: 'StatsActionFollow',

	mixins: [ observe( 'followSite' ) ],

	clickHandler: function ( event ) {
		const site = this.props.followSite;
		let gaEvent;

		event.stopPropagation();
		event.preventDefault();
		debug( 'handling follower click', this.props.data );

		if ( ! site.is_following ) {
			gaEvent = 'Follow';
			site.follow();
		} else {
			gaEvent = 'Unfollow';
			site.unfollow();
		}

		gaRecordEvent( 'Stats', 'Clicked ' + gaEvent + ' in ' + this.props.moduleName + ' List' );
	},

	render: function () {
		const site = this.props.followSite;
		const following = site.is_following;
		const wrapperClass = classNames( 'module-content-list-item-action-wrapper', {
			follow: ! following,
			following: following,
		} );
		const label = following
			? this.props.translate( 'Following', {
					context: 'Stats: Follow action / Following status',
			  } )
			: this.props.translate( 'Follow', {
					context: 'Stats: Follow action / Following status',
			  } );
		const gridiconType = following ? 'reader-following' : 'reader-follow';
		const wrapperClassSet = classNames( wrapperClass );

		return (
			<li className="module-content-list-item-action">
				<a
					href="#"
					onClick={ this.clickHandler }
					className={ wrapperClassSet }
					title={ site.blog_domain }
					aria-label={ this.props.translate( 'Follow or unfollow user', {
						textOnly: true,
						context: 'Stats ARIA label: Follow/Unfollow action',
					} ) }
				>
					<span className="module-content-list-item-action-label">
						<Gridicon icon={ gridiconType } size={ 18 } />
						{ label }
					</span>
					<span className="module-content-list-item-action-label unfollow">
						<Gridicon icon="cross" size={ 18 } />
						{ this.props.translate( 'Unfollow', {
							context: 'Stats ARIA label: Unfollow action',
						} ) }
					</span>
				</a>
			</li>
		);
	},
} );

export default localize( StatsActionFollow );
