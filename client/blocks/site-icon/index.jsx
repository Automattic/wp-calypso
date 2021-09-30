import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import QuerySites from 'calypso/components/data/query-sites';
import Image from 'calypso/components/image';
import Spinner from 'calypso/components/spinner';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import MediaImage from 'calypso/my-sites/media-library/media-image';
import getSiteIconId from 'calypso/state/selectors/get-site-icon-id';
import getSiteIconUrl from 'calypso/state/selectors/get-site-icon-url';
import isTransientMedia from 'calypso/state/selectors/is-transient-media';
import { getSite } from 'calypso/state/sites/selectors';

import './style.scss';

function SiteIcon( { siteId, site, iconUrl, size, imgSize, isTransientIcon } ) {
	const iconSrc = resizeImageUrl( iconUrl, imgSize );

	const classes = classNames( 'site-icon', {
		'is-blank': ! iconSrc,
		'is-transient': isTransientIcon,
	} );

	const style = {
		height: size,
		width: size,
		lineHeight: size + 'px',
		fontSize: size + 'px',
	};

	return (
		<div className={ classes } style={ style }>
			{ ! site && siteId > 0 && <QuerySites siteId={ siteId } /> }
			{ iconSrc ? (
				<MediaImage component={ Image } className="site-icon__img" src={ iconSrc } alt="" />
			) : (
				<Gridicon icon="globe" size={ Math.round( size / 1.8 ) } />
			) }
			{ isTransientIcon && <Spinner /> }
		</div>
	);
}

SiteIcon.propTypes = {
	siteId: PropTypes.number,
	site: PropTypes.object,
	iconUrl: PropTypes.string,
	size: PropTypes.number,
	imgSize: PropTypes.number,
	isTransientIcon: PropTypes.bool,
};

SiteIcon.defaultProps = {
	// Cache a larger image so there's no need to download different assets to
	// display the site icons in different contexts.
	imgSize: 120,
	size: 32,
};

export default connect( ( state, { site, siteId, imgSize } ) => {
	// Always prefer site from Redux state if available
	const stateSite = getSite( state, get( site, 'ID', siteId ) );

	// Until all sites state is within Redux, we provide compatibility in cases
	// where sites-list object is passed to use the icon.img property as URL.
	// Specifically this shows icon for non-selected <SiteSelector /> sites,
	// since only the selected site is currently received into state.
	if ( ! stateSite ) {
		return {
			iconUrl: get( site, 'icon.img' ),
		};
	}

	const iconId = getSiteIconId( state, stateSite.ID );

	return {
		site: stateSite,
		iconUrl: getSiteIconUrl( state, stateSite.ID, imgSize ),
		isTransientIcon: isTransientMedia( state, stateSite.ID, iconId ),
	};
} )( SiteIcon );
