import { get } from 'lodash';
import { connect } from 'react-redux';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import DomainTip from '../index';

const DomainTipExample = ( { siteId } ) => (
	<DomainTip siteId={ siteId } event="domain_app_example" />
);

const ConnectedDomainTipExample = connect( ( state ) => ( {
	siteId: get( getCurrentUser( state ), 'primary_blog', null ),
} ) )( DomainTipExample );

ConnectedDomainTipExample.displayName = 'DomainTip';

export default ConnectedDomainTipExample;
