/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import ExtensionRedirect from 'client/blocks/extension-redirect';
import DocumentHead from 'client/components/data/document-head';
import Main from 'client/components/main';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import QueryZones from '../data/query-zones';

const Settings = ( { children, siteId, translate } ) => {
	const mainClassName = 'zoninator__main';

	return (
		<Main className={ mainClassName }>
			<ExtensionRedirect pluginId="zoninator" siteId={ siteId } />
			<QueryZones siteId={ siteId } />
			<DocumentHead title={ translate( 'WP Zone Manager' ) } />
			{ children }
		</Main>
	);
};

const connectComponent = connect( state => ( {
	siteId: getSelectedSiteId( state ),
} ) );

export default flowRight( connectComponent, localize )( Settings );
