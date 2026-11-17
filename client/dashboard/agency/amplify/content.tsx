import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../components/card';
import { Text } from '../../components/text';
import AmplifyReportCreator from './report-creator';
import AmplifyReportsList from './reports';
import { AmplifyUsageCard } from './usage-meter';
import type { AmplifyTiersLink } from './types';
import type { AmplifyPage } from './use-amplify-page';

import './content.scss';

/** The Prospect reports page body: the first-visit overview, or the reports and their usage. */
export default function AmplifyContent( {
	page,
	tiersLink,
}: {
	page: AmplifyPage;
	tiersLink?: AmplifyTiersLink;
} ) {
	const { agencyId, state, usage, usageStatus, tierId } = page;
	return (
		<VStack spacing={ 0 } className="dashboard-amplify-view">
			{ state === 'empty' && (
				<Card>
					<AmplifyReportCreator
						agencyId={ agencyId }
						canScan={ page.canScan }
						usage={ usage }
						usageStatus={ usageStatus }
						tierId={ tierId }
						tiersLink={ tiersLink }
						onUsageError={ page.handleUsageError }
					/>
				</Card>
			) }
			{ state === 'reports' && (
				<VStack className="dashboard-amplify-results" spacing={ 4 }>
					<AmplifyUsageCard
						agencyId={ agencyId }
						usage={ usage }
						status={ usageStatus }
						tierId={ tierId }
						tiersLink={ tiersLink }
					/>
					<AmplifyReportsList agencyId={ agencyId } reports={ page.reports } />
				</VStack>
			) }
			{ state === 'loading' && (
				<AmplifyReportsList agencyId={ agencyId } reports={ [] } isLoading />
			) }
			{ state === 'error' && (
				<Card>
					<CardBody>
						<VStack role="alert" spacing={ 4 } alignment="flex-start">
							<Text>{ __( 'Unable to load reports. Please try again.' ) }</Text>
							<Button __next40pxDefaultSize variant="secondary" onClick={ page.refetch }>
								{ __( 'Retry' ) }
							</Button>
						</VStack>
					</CardBody>
				</Card>
			) }
		</VStack>
	);
}
