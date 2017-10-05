/**
 * External dependencies
 */
import React from 'react';

import classNames from 'classnames';
import debugFactory from 'debug';
const debug = debugFactory('calypso:stats:action-follow');

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';

import analytics from 'lib/analytics';
import Gridicon from 'gridicons';

module.exports = React.createClass( {
	displayName: 'StatsActionFollow',

	mixins: [ observe( 'followSite' ) ],

	clickHandler: function( event ) {
		var site = this.props.followSite,
			gaEvent;

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

		analytics.ga.recordEvent( 'Stats', 'Clicked ' + gaEvent + ' in ' + this.props.moduleName + ' List' );
	},

	render: function() {
		var site = this.props.followSite,
			following = site.is_following,
			wrapperClass = classNames( 'module-content-list-item-action-wrapper', {
				follow: ! following,
				following: following
			} ),
			label = following ?
				this.translate( 'Following', {
					context: 'Stats: Follow action / Following status'
				} ) :
				this.translate( 'Follow', {
					context: 'Stats: Follow action / Following status'
				} ),
			gridiconType = following ? 'reader-following' : 'reader-follow',
			wrapperClassSet;

		wrapperClassSet = classNames( wrapperClass );

		return (
			<li className='module-content-list-item-action'>
				<a href='#' onClick={ this.clickHandler } className={ wrapperClassSet } title={ site.blog_domain } aria-label={ this.translate( 'Follow or unfollow user', { textOnly: true, context: 'Stats ARIA label: Follow/Unfollow action' } ) } >
					<span className='module-content-list-item-action-label'><Gridicon icon={ gridiconType } size={ 18 } />{ label }</span>
					<span className='module-content-list-item-action-label unfollow'><Gridicon icon="cross" size={ 18 } />{ this.translate( 'Unfollow', { context: 'Stats ARIA label: Unfollow action' } ) }</span>
				</a>
			</li>
		);
	}
} );
