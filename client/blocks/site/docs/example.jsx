/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Site from 'blocks/site';
import Card from 'components/card';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSite } from 'state/sites/selectors';

const SiteExample = ( { site } ) =>
	<Card style={ { padding: 0 } }>
		<Site site={ site } />
		<Site compact site={ site } homeLink={ true } />
	</Card>;

const ConnectedSiteExample = connect( state => ( {
	site: getSite( state, get( getCurrentUser( state ), 'primary_blog', null ) ),
} ) )( SiteExample );

ConnectedSiteExample.displayName = 'Site';

export default ConnectedSiteExample;
