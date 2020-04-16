/**
 * External dependencies
 *
 */

import React, { FunctionComponent, useCallback } from 'react';
import { MomentInput, Moment } from 'moment';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import getSiteId from 'state/selectors/get-site-id';
import { applySiteOffset } from 'lib/site/timezone';
import getSiteGmtOffset from 'state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'state/selectors/get-site-timezone-value';
import QuerySiteSettings from 'components/data/query-site-settings'; // Required to get site time offset

export type contextTypeLoaded = ( input: MomentInput ) => Moment;
export type contextType = contextTypeLoaded | null;

const SiteOffsetContext = React.createContext< contextType >( null );

interface Props {
	site: string;
}

const SiteOffsetProvider: FunctionComponent< Props > = ( { children, site } ) => {
	// hackery here to get around
	const siteId = useSelector( state => getSiteId( state, site ) ) as number | null;

	const gmtOffset = useSelector( state => ( siteId ? getSiteGmtOffset( state, siteId ) : null ) );
	const timezone = useSelector( state =>
		siteId ? getSiteTimezoneValue( state, siteId ) : null
	);

	const value = useCallback(
		( input: MomentInput ) => applySiteOffset( input, { gmtOffset, timezone } ),
		[ gmtOffset, timezone ]
	);

	return (
		<>
			<QuerySiteSettings siteId={ siteId } />
			<SiteOffsetContext.Provider value={ gmtOffset !== null || timezone !== null ? value : null }>
				{ children }
			</SiteOffsetContext.Provider>
		</>
	);
};

export { SiteOffsetContext, SiteOffsetProvider };
