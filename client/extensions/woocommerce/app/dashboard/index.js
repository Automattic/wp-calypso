/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Main from 'calypso/components/main';
import StoreMoveNoticeView from './store-move-notice-view';

function Dashboard( className ) {
	const translate = useTranslate();

	return (
		<Main className={ classNames( 'dashboard', className ) } wideLayout>
			<ActionHeader breadcrumbs={ translate( 'Store' ) } />
			<StoreMoveNoticeView />
		</Main>
	);
}

export default Dashboard;
