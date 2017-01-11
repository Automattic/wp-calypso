/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import QuerySites from 'components/data/query-sites';
import { getSite } from 'state/sites/selectors';
import { getSiteIconUrl } from 'state/selectors';
import resizeImageUrl from 'lib/resize-image-url';
import Gridicon from 'components/gridicon';

function SiteIcon( { siteId, site, iconUrl, size, imgSize } ) {
	const iconSrc = resizeImageUrl( iconUrl, imgSize );

	const classes = classNames( 'site-icon', {
		'is-blank': ! iconSrc
	} );

	const style = {
		height: size,
		width: size,
		lineHeight: size + 'px',
		fontSize: size + 'px'
	};

	return (
		<div className={ classes } style={ style }>
			{ ! site && siteId > 0 && <QuerySites siteId={ siteId } /> }
			{ iconSrc
				? <img className="site-icon__img" src={ iconSrc } />
				: <Gridicon icon="globe" size={ Math.round( size / 1.3 ) } />
			}
		</div>
	);
}

SiteIcon.propTypes = {
	siteId: PropTypes.number,
	site: PropTypes.object,
	iconUrl: PropTypes.string,
	size: PropTypes.number,
	imgSize: PropTypes.number
};

SiteIcon.defaultProps = {
	// Cache a larger image so there's no need to download different assets to
	// display the site icons in different contexts.
	imgSize: 120,
	size: 32
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
			iconUrl: get( site, 'icon.img' )
		};
	}

	return {
		site: stateSite,
		iconUrl: getSiteIconUrl( state, stateSite.ID, imgSize )
	};
} )( SiteIcon );
