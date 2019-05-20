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

interface ConnectProps {
	getExternalContributors: ( siteId: SiteId ) => void;
}

const QueryExternalContributors: FunctionComponent< OwnProps & ConnectProps > = ( {
	siteId,
	getExternalContributors: request,
} ) => {
	useEffect( () => {
		request( siteId );
	}, [ siteId, request ] );

	return null;
};

export default connect(
	null,
	{ getExternalContributors }
)( QueryExternalContributors );
