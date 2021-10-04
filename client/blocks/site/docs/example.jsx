import { Card } from '@automattic/components';
import { get } from 'lodash';
import { connect } from 'react-redux';
import Site from 'calypso/blocks/site';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getSite } from 'calypso/state/sites/selectors';

const SiteExample = ( { site } ) => (
	<Card style={ { padding: 0 } }>
		<Site site={ site } homeLink />
		<Site compact site={ site } homeLink={ true } />
	</Card>
);

const ConnectedSiteExample = connect( ( state ) => ( {
	site: getSite( state, get( getCurrentUser( state ), 'primary_blog', null ) ),
} ) )( SiteExample );

ConnectedSiteExample.displayName = 'Site';

export default ConnectedSiteExample;
