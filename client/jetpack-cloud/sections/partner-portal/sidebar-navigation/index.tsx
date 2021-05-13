/**
 * External dependencies
 */

import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal Dependencies
 */
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import { getDocumentHeadTitle } from 'calypso/state/document-head/selectors/get-document-head-title';

/**
 * Style dependencies
 */
import './style.scss';

export default function PartnerPortalSidebarNavigation(): ReactElement {
	const headerTitle = useSelector( getDocumentHeadTitle );

	return <SidebarNavigation sectionTitle={ headerTitle } />;
}
