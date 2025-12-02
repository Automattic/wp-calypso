import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RecoveryEmail from './recovery-email';
import RecoverySMS from './recovery-sms';

export default function SecurityAccountRecovery() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Account recovery' ) }
					description={ __(
						'If you ever have problems accessing your account, WordPress.com will use what you enter here to verify your identity.'
					) }
				/>
			}
		>
			<RecoveryEmail />
			<RecoverySMS />
		</PageLayout>
	);
}
