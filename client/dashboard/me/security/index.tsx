import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

function Security() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Security' ) }
					description={ __( 'Manage your security settings.' ) }
				/>
			}
		>
			<VStack spacing={ 4 }>
				<RouterLinkSummaryButton title={ __( 'Details' ) } to="/me/security" />
			</VStack>
		</PageLayout>
	);
}

export default Security;
