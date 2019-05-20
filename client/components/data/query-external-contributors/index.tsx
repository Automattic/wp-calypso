/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { useEffect, FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { getExternalContributors } from 'state/sites/external-contributors/actions';

/**
 * Types
 */
import { SiteId } from 'types';

interface OwnProps {
	siteId: SiteId;
}

interface DispatchProps {
	getExternalContributors: ( siteId: SiteId ) => void;
}

const QueryExternalContributors: FunctionComponent< OwnProps & DispatchProps > = ( {
	siteId,
	getExternalContributors: request,
} ) => {
	useEffect( () => {
		request( siteId );
	}, [ siteId, request ] );

	return null;
};

export default connect< {}, DispatchProps, OwnProps >(
	null,
	{ getExternalContributors }
)( QueryExternalContributors );
