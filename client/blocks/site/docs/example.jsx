/** @format */
/**
* External dependencies
*/
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Site from 'client/blocks/site';
import Card from 'client/components/card';
import { getCurrentUser } from 'client/state/current-user/selectors';
import { getSite } from 'client/state/sites/selectors';

const SiteExample = ( { site } ) => (
	<Card style={ { padding: 0 } }>
		<Site site={ site } />
		<Site compact site={ site } homeLink={ true } />
	</Card>
);

const ConnectedSiteExample = connect( state => ( {
	site: getSite( state, get( getCurrentUser( state ), 'primary_blog', null ) ),
} ) )( SiteExample );

ConnectedSiteExample.displayName = 'Site';

export default ConnectedSiteExample;
