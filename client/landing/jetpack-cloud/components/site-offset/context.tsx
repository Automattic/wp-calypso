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

type contextType = ( input: MomentInput ) => Moment | null;

const SiteOffsetContext = React.createContext< contextType >( () => null );

interface Props {
	site: string;
}

const SiteOffsetProvider: FunctionComponent< Props > = ( { children, site } ) => {
	// hackery here to get around
	const siteId = useSelector( state => getSiteId( state, site ) ) as number | null;

	const gmtOffset = useSelector( state => ( siteId ? getSiteGmtOffset( state, siteId ) : null)  );
	const timezone = useSelector( state =>
		siteId ? getSiteTimezoneValue( state, siteId ) : null
	);

	const value = useCallback(
		( input: MomentInput ) =>
			gmtOffset || timezone ? applySiteOffset( input, { gmtOffset, timezone } ) : null,
		[ gmtOffset, timezone ]
	);

	return (
		<>
			<QuerySiteSettings siteId={ siteId } />
			<SiteOffsetContext.Provider value={ value }>{ children }</SiteOffsetContext.Provider>
		</>
	);
};

export { SiteOffsetContext, SiteOffsetProvider };
