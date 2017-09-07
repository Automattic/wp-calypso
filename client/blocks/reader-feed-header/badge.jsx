/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';

const ReaderFeedHeaderSiteBadge = ( { site } ) => {
	/* eslint-disable wpcalypso/jsx-gridicon-size */
	if ( site && site.is_private ) {
		return <Gridicon icon="lock" size={ 14 } />;
	} else if ( site && site.options && site.options.is_redirect ) {
		return <Gridicon icon="block" size={ 14 } />;
	} else if ( site && site.options && site.options.is_domain_only ) {
		return <Gridicon icon="domains" size={ 14 } />;
	}

	return null;
	/* eslint-enable wpcalypso/jsx-gridicon-size */
};

ReaderFeedHeaderSiteBadge.propTypes = {
	site: React.PropTypes.object,
};

export default ReaderFeedHeaderSiteBadge;
