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

interface Props {
	siteId: SiteId;
}

const mapDispatchToProps = { getExternalContributors };

const QueryExternalContributors: FunctionComponent< Props & typeof mapDispatchToProps > = ( {
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
	mapDispatchToProps
)( QueryExternalContributors );
