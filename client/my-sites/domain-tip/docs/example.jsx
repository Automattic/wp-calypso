/**
 * External dependencies
 */
import { get } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import DomainTip from '../index';
import { getCurrentUser } from 'state/current-user/selectors';

const DomainTipExample = ( { siteId } ) => (
	<DomainTip siteId={ siteId } event="domain_app_example" />
);

const ConnectedDomainTipExample = connect(
	( state ) => ( {
		siteId: get( getCurrentUser( state ), 'primary_blog', null )
	} )
)( DomainTipExample );

ConnectedDomainTipExample.displayName = 'DomainTip';

export default ConnectedDomainTipExample;
