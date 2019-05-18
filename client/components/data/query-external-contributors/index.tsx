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
import { SiteId, UserId } from 'types';

interface OwnProps {
	siteId: SiteId;
}

interface ConnectProps {
	getExternalContributors: ( siteId: SiteId ) => [UserId];
}

const QueryExternalContributors: FunctionComponent< OwnProps & ConnectProps > = ( {
	siteId,
	getExternalContributors,
} ) => {
	useEffect( () => {
		getExternalContributors( siteId );
	}, [ siteId, getExternalContributors ] );

	return null;
};

export default connect(
	// ( state, { siteId }}  ) => ( {
	// 	requestingEmailForwards: isRequestingEmailForwards( state, siteId ),
	// } ),
	null,
	{ getExternalContributors }
)( QueryExternalContributors );
