/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { translate } from 'i18n-calypso';
import FollowButton from 'reader/follow-button';
import { getLinkProps } from './helper';
import * as discoverStats from './stats';

const arrowGridicon = (
	<svg className="gridicon gridicon-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<path d="M20 11H6.414l6.293-6.293-1.414-1.414L2.586 12l8.707 8.707 1.414-1.414L6.414 13H20"/>
	</svg>
);

class DiscoverPostAttribution extends React.Component {

	constructor( props ) {
		super( props );

		[ 'recordAuthorClick', 'recordSiteClick', 'recordFollowToggle' ].forEach(
			( method ) => this[ method ] = this[ method ].bind( this )
		);
	}

	static propTypes = {
		attribution: React.PropTypes.shape( {
			author_name: React.PropTypes.string.isRequired,
			author_url: React.PropTypes.string.isRequired,
			blog_name: React.PropTypes.string.isRequired,
			blog_url: React.PropTypes.string.isRequired,
			avatar_url: React.PropTypes.string
		} ).isRequired,
		siteUrl: React.PropTypes.string.isRequired,
		followUrl: React.PropTypes.string.isRequired
	}

	recordAuthorClick( ) {
		discoverStats.recordAuthorClick( this.props.attribution.author_url );
	}

	recordSiteClick( ) {
		discoverStats.recordSiteClick( this.props.siteUrl );
	}

	recordFollowToggle( isFollowing ) {
		discoverStats.recordFollowingToggle( isFollowing, this.props.siteUrl );
	}

	render() {
		const attribution = this.props.attribution;
		const classes = classNames( 'discover-attribution is-post', {
			'is-missing-avatar': ! attribution.avatar_url
		} );
		const siteLinkProps = getLinkProps( this.props.siteUrl );
		const siteClasses = classNames( 'discover-attribution__blog ignore-click' );

		return (
			<div className={ classes }>
				{ attribution.avatar_url ? <img className="gravatar" src={ encodeURI( attribution.avatar_url ) } alt="Avatar" width="20" height="20" /> : arrowGridicon }
				<span className="discover-attribution__text">
					{ translate( 'Originally posted by' ) }&nbsp;
					<a className="discover-attribution__author" rel="external" target="_blank" onClick={ this.recordAuthorClick } href={ encodeURI( attribution.author_url ) }>
						{ attribution.author_name }
					</a>&nbsp;
					{ translate( 'on' ) }&nbsp;
					<a { ...siteLinkProps } className={ siteClasses } onClick={ this.recordSiteClick } href={ encodeURI( this.props.siteUrl ) }>
						{ attribution.blog_name }
					</a>
					{ !! this.props.followUrl ? <FollowButton siteUrl={ this.props.followUrl } iconSize={ 20 } onFollowToggle={ this.recordFollowToggle }/> : null }
				</span>
			</div>
		);
	}
}

module.exports = DiscoverPostAttribution;
