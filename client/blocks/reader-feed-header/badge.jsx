/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import GridiconDomains from 'gridicons/dist/domains';
import GridiconBlock from 'gridicons/dist/block';
import GridiconLock from 'gridicons/dist/lock';

const ReaderFeedHeaderSiteBadge = ( { site } ) => {
	/* eslint-disable wpcalypso/jsx-gridicon-size */
	if ( site && site.is_private ) {
		return <GridiconLock size={ 14 } />;
	} else if ( site && site.options && site.options.is_redirect ) {
		return <GridiconBlock size={ 14 } />;
	} else if ( site && site.options && site.options.is_domain_only ) {
		return <GridiconDomains size={ 14 } />;
	}

	return null;
	/* eslint-enable wpcalypso/jsx-gridicon-size */
};

ReaderFeedHeaderSiteBadge.propTypes = {
	site: PropTypes.object,
};

export default ReaderFeedHeaderSiteBadge;
