import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import FeatureExample from 'calypso/components/feature-example';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { useDispatch } from 'calypso/state';
import { activateModule } from 'calypso/state/jetpack/modules/actions';

interface Props {
	siteId: number;
	children?: ReactNode;
}
export default function SsoNotice( props: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { siteId, children } = props;

	function enableSSO() {
		dispatch( activateModule( siteId, 'sso' ) );
	}

	return (
		<div className="invite-people__action-required">
			<Notice
				status="is-warning"
				showDismiss={ false }
				text={ translate( 'Inviting users requires WordPress.com sign in' ) }
			>
				<NoticeAction onClick={ enableSSO }>{ translate( 'Enable' ) }</NoticeAction>
			</Notice>
			<FeatureExample>{ children }</FeatureExample>
		</div>
	);
}
