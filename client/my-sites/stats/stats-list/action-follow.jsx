/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:stats:action-follow' );

var createReactClass = require('create-react-class');

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	analytics = require( 'lib/analytics' ),
	Gridicon = require( 'gridicons' );

module.exports = localize(createReactClass({
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
				this.props.translate( 'Following', {
					context: 'Stats: Follow action / Following status'
				} ) :
				this.props.translate( 'Follow', {
					context: 'Stats: Follow action / Following status'
				} ),
			gridiconType = following ? 'reader-following' : 'reader-follow',
			wrapperClassSet;

		wrapperClassSet = classNames( wrapperClass );

		return (
		    <li className='module-content-list-item-action'>
				<a href='#' onClick={ this.clickHandler } className={ wrapperClassSet } title={ site.blog_domain } aria-label={ this.props.translate( 'Follow or unfollow user', { textOnly: true, context: 'Stats ARIA label: Follow/Unfollow action' } ) } >
					<span className='module-content-list-item-action-label'><Gridicon icon={ gridiconType } size={ 18 } />{ label }</span>
					<span className='module-content-list-item-action-label unfollow'><Gridicon icon="cross" size={ 18 } />{ this.props.translate( 'Unfollow', { context: 'Stats ARIA label: Unfollow action' } ) }</span>
				</a>
			</li>
		);
	}
}));
