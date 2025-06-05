import { safeImageUrl } from '@automattic/calypso-url';
import { Card } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import BlogStickers from 'calypso/blocks/blog-stickers';
import SiteIcon from 'calypso/blocks/site-icon';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import withDimensions from 'calypso/lib/with-dimensions';
import {
	getFollowerCount,
	getSiteDescription,
	getSiteName,
	getSiteUrl,
} from 'calypso/reader/get-helpers';
import { getSafeImageUrlForReader } from 'calypso/reader/utils';
import ReaderFeedHeaderSiteBadge from './badge';
import ReaderFeedHeaderFollow from './follow';
import './style.scss';

class FeedHeader extends Component {
	static propTypes = {
		site: PropTypes.object,
		feed: PropTypes.object,
		streamKey: PropTypes.string,
		isWPForTeamsItem: PropTypes.bool,
		hasOrganization: PropTypes.bool,
	};

	state = {
		isSuggestedFollowsModalOpen: false,
	};

	render() {
		const { site, feed, streamKey, translate, width } = this.props;
		const followerCount = getFollowerCount( feed, site );
		const description = getSiteDescription( { site, feed } );
		const siteTitle = getSiteName( { feed, site } );
		const siteUrl = getSiteUrl( { feed, site } );
		const siteIcon = site ? get( site, 'icon.img' ) : null;
		const wideDisplay = width > 900;
		const narrowDisplay = width < 480;

		const classes = clsx( 'reader-feed-header', {
			'is-placeholder': ! site && ! feed,
			'is-wide-display': wideDisplay,
		} );

		let feedIcon = feed ? feed.site_icon ?? get( feed, 'image' ) : null;
		// don't show the default favicon for some sites
		if ( feedIcon?.endsWith( 'wp.com/i/buttonw-com.png' ) ) {
			feedIcon = null;
		}

		let fakeSite;

		const safeSiteIcon = safeImageUrl( siteIcon );
		const safeFeedIcon = getSafeImageUrlForReader( feedIcon );

		if ( safeSiteIcon ) {
			fakeSite = {
				icon: {
					img: safeSiteIcon,
				},
			};
		} else if ( safeFeedIcon ) {
			fakeSite = {
				icon: {
					img: safeFeedIcon,
				},
			};
		}

		const siteIconElement = (
			<a href={ siteUrl } className="reader-feed-header__site-icon">
				<SiteIcon key="site-icon" size={ narrowDisplay ? 72 : 116 } site={ fakeSite } />
			</a>
		);

		return (
			<div className={ classes }>
				<QueryUserSettings />
				<Card className="reader-feed-header__site">
					{ ! narrowDisplay && siteIconElement }
					<div className="reader-feed-header__details">
						<div className="reader-feed-header__site-title">
							{ narrowDisplay && siteIconElement }
							<a className="reader-feed-header__site-title-link" href={ siteUrl }>
								{ siteTitle }
							</a>
							{ site && (
								<span className="reader-feed-header__site-badge">
									<ReaderFeedHeaderSiteBadge site={ site } />
									<BlogStickers blogId={ site.ID } />
								</span>
							) }
						</div>
						<div className="reader-feed-header__description">{ description }</div>
						{ ! wideDisplay && followerCount && (
							<div className="reader-feed-header__follow-count">
								{ ' ' }
								{ translate( '%s subscriber', '%s subscribers', {
									count: followerCount,
									args: [ formatNumber( followerCount ) ],
									comment: '%s is the number of subscribers. For example: "12,000,000"',
								} ) }
							</div>
						) }
					</div>
				</Card>
				{ ! wideDisplay && (
					<ReaderFeedHeaderFollow feed={ feed } site={ site } streamKey={ streamKey } />
				) }
			</div>
		);
	}
}

export default localize( withDimensions( FeedHeader ) );
