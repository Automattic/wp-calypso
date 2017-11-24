/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { get } from 'lodash';
import path from 'path';

/**
 * Internal dependencies
 */
import { translate } from 'i18n-calypso';
import FollowButton from 'reader/follow-button';
import { getLinkProps } from './helper';
import { recordFollowToggle, recordSiteClick } from './stats';
import { getSiteUrl, getSourceFollowUrl, getSourceData } from 'reader/discover/helper';
import SiteIcon from 'blocks/site-icon';

class DiscoverSiteAttribution extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
	};

	onSiteClick = () => recordSiteClick( this.props.siteUrl );

	onFollowToggle = isFollowing => recordFollowToggle( isFollowing, this.props.siteUrl );

	render() {
		const { post } = this.props;
		const attribution = get( post, 'discover_metadata.attribution' );
		const siteUrl = getSiteUrl( post );
		const followUrl = getSourceFollowUrl( post );
		const { blogId } = getSourceData( post );
		const classes = classNames( 'discover-attribution is-site', {
			'is-missing-avatar': ! attribution.avatar_url,
		} );
		const siteLinkProps = getLinkProps( siteUrl );
		const siteClasses = classNames( 'discover-attribution__blog ignore-click' );

		let avatarUrl = attribution.avatar_url;
		// Drop default avatar
		if ( path.basename( avatarUrl ) === 'defaultavatar.png' ) {
			avatarUrl = null;
		}

		return (
			<div className={ classes }>
				{ avatarUrl ? (
					<img
						className="gravatar"
						src={ encodeURI( attribution.avatar_url ) }
						alt="Avatar"
						width="20"
						height="20"
					/>
				) : (
					<SiteIcon siteId={ blogId } size={ 20 } />
				) }
				<span>
					<a
						{ ...siteLinkProps }
						className={ siteClasses }
						href={ encodeURI( siteUrl ) }
						onClick={ this.onSiteClick }
					>
						{ translate( 'visit' ) } <em>{ attribution.blog_name }</em>
					</a>
				</span>
				{ followUrl && (
					<FollowButton
						siteUrl={ followUrl }
						iconSize={ 20 }
						onFollowToggle={ this.onFollowToggle }
					/>
				) }
			</div>
		);
	}
}

export default DiscoverSiteAttribution;
