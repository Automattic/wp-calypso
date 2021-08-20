import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
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
