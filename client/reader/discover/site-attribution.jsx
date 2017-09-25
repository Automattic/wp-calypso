/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { getLinkProps } from './helper';
import { recordFollowToggle, recordSiteClick } from './stats';
import FollowButton from 'reader/follow-button';

class DiscoverSiteAttribution extends React.Component {
	static propTypes = {
		attribution: PropTypes.shape( {
			blog_name: PropTypes.string.isRequired,
			blog_url: PropTypes.string.isRequired,
			avatar_url: PropTypes.string,
		} ).isRequired,
		siteUrl: PropTypes.string.isRequired,
		followUrl: PropTypes.string.isRequired,
	};

	onSiteClick = () => recordSiteClick( this.props.siteUrl );

	onFollowToggle = isFollowing => recordFollowToggle( isFollowing, this.props.siteUrl );

	render() {
		const attribution = this.props.attribution;
		const classes = classNames( 'discover-attribution is-site', {
			'is-missing-avatar': ! attribution.avatar_url,
		} );
		const siteLinkProps = getLinkProps( this.props.siteUrl );
		const siteClasses = classNames( 'discover-attribution__blog ignore-click' );

		return (
			<div className={ classes }>
				{ attribution.avatar_url ? (
					<img
						className="gravatar"
						src={ encodeURI( attribution.avatar_url ) }
						alt="Avatar"
						width="20"
						height="20"
					/>
				) : (
					<span className="noticon noticon-website" />
				) }
				<span>
					<a
						{ ...siteLinkProps }
						className={ siteClasses }
						href={ encodeURI( this.props.siteUrl ) }
						onClick={ this.onSiteClick }
					>
						{ translate( 'visit' ) } <em>{ attribution.blog_name }</em>
					</a>
				</span>
				{ !! this.props.followUrl ? (
					<FollowButton
						siteUrl={ this.props.followUrl }
						iconSize={ 20 }
						onFollowToggle={ this.onFollowToggle }
					/>
				) : null }
			</div>
		);
	}
}

export default DiscoverSiteAttribution;
