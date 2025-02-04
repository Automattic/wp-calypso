import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import Main from 'calypso/components/main';
import ActionHeader from '../../components/action-header';
import StoreMoveNoticeView from './store-move-notice-view';

function Dashboard( className ) {
	const translate = useTranslate();

	return (
		<Main className={ clsx( 'dashboard', className ) } wideLayout>
			<ActionHeader breadcrumbs={ translate( 'Store' ) } />
			<StoreMoveNoticeView />
		</Main>
	);
}

export default Dashboard;
