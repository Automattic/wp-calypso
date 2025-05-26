import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

function Privacy() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Privacy' ) }
					description={ __( 'Manage your privacy settings.' ) }
				/>
			}
		>
			<VStack spacing={ 4 }>
				<RouterLinkSummaryButton title={ __( 'Details' ) } to="/me/privacy" />
			</VStack>
		</PageLayout>
	);
}

export default Privacy;
