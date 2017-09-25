/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryZones from '../data/query-zones';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import { getSelectedSiteId } from 'state/ui/selectors';

const Settings = ( {
	children,
	siteId,
	translate,
} ) => {
	const mainClassName = 'zoninator__main';

	return (
		<Main className={ mainClassName }>
			<QueryZones siteId={ siteId } />
			<DocumentHead title={ translate( 'WP Zone Manager' ) } />
			{ children }
		</Main>
	);
};

const connectComponent = connect( state => ( {
	siteId: getSelectedSiteId( state ),
} ) );

export default flowRight(
	connectComponent,
	localize,
)( Settings );
