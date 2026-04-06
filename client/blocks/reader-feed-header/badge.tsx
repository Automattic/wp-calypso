import { Site } from '@automattic/api-core';
import { Gridicon } from '@automattic/components';

interface ReaderFeedHeaderSiteBadgeProps {
	site?: Site;
}

const ReaderFeedHeaderSiteBadge = ( {
	site,
}: ReaderFeedHeaderSiteBadgeProps ): JSX.Element | null => {
	/* eslint-disable wpcalypso/jsx-gridicon-size */
	if ( site && site.is_private ) {
		return <Gridicon icon="lock" size={ 14 } />;
	} else if ( site && site.options && site.options.is_redirect ) {
		return <Gridicon icon="block" size={ 14 } />;
	} else if ( site && site.options && site.options.is_domain_only ) {
		return <Gridicon icon="domains" size={ 14 } />;
	}

	return null;
};

export default ReaderFeedHeaderSiteBadge;
