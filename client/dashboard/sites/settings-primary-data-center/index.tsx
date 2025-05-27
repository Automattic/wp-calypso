import SummaryButton from '@automattic/components/src/summary-button';
import { __experimentalVStack as VStack, Icon, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { cloud } from '@wordpress/icons';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import type { Site } from '../../data/types';

export function canGetPrimaryDataCenter( site: Site ) {
	return site.is_wpcom_atomic;
}

export default function PrimaryDataCenterSettings() {
	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
					title={ __( 'Primary data center' ) }
					description={ __(
						'The primary data center is where your site is physically located. For redundancy, your site also replicates in real-time to a second data center in a different region.'
					) }
				/>
			}
		>
			<VStack spacing={ 8 }>
				<Notice isDismissible={ false }>
					{ __(
						'Your site has already been placed in the optimal data center. It’s not currently possible to change your primary data center.'
					) }
				</Notice>
				<SummaryButton
					title={ __( 'Primary data center' ) }
					decoration={ <Icon icon={ cloud } /> }
					showArrow={ false }
					disabled
				/>
			</VStack>
		</PageLayout>
	);
}
