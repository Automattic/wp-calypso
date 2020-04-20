/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { get, endsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { translate } from 'i18n-calypso';
import FollowButton from 'reader/follow-button';
import { getLinkProps } from './helper';
import { recordFollowToggle, recordSiteClick } from './stats';
import { getSiteUrl, getSourceFollowUrl, getSourceData } from 'reader/discover/helper';
import SiteIcon from 'blocks/site-icon';
import { getSite } from 'state/reader/sites/selectors';
import QueryReaderSite from 'components/data/query-reader-site';

/**
 * Style dependencies
 */
import './site-attribution.scss';

class DiscoverSiteAttribution extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
	};

	onSiteClick = () => recordSiteClick( this.props.siteUrl );

	onFollowToggle = ( isFollowing ) => recordFollowToggle( isFollowing, this.props.siteUrl );

	render() {
		const { post, site } = this.props;
		const attribution = get( post, 'discover_metadata.attribution' );
		const siteUrl = getSiteUrl( post );
		const followUrl = getSourceFollowUrl( post );
		const { blogId: siteId } = getSourceData( post );
		const siteLinkProps = getLinkProps( siteUrl );
		const siteClasses = classNames( 'discover-attribution__blog ignore-click' );

		let avatarUrl = attribution.avatar_url;
		// Drop default avatar
		if ( endsWith( avatarUrl, 'defaultavatar.png' ) ) {
			avatarUrl = null;
		}

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="discover-attribution is-site">
				{ avatarUrl && (
					<img
						className="gravatar"
						src={ encodeURI( attribution.avatar_url ) }
						alt="Avatar"
						width="20"
						height="20"
					/>
				) }
				{ ! avatarUrl && siteId && ! site && <QueryReaderSite siteId={ siteId } /> }
				{ ! avatarUrl && <SiteIcon site={ site } size={ 20 } /> }
				<span className="discover-attribution__site-title">
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
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( ( state, ownProps ) => {
	const { blogId: siteId } = getSourceData( ownProps.post );
	return {
		site: getSite( state, siteId ),
	};
} )( DiscoverSiteAttribution );
