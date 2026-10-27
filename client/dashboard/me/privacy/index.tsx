import config from '@automattic/calypso-config';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { EmailTrackingCard } from '../notifications-extras/email-tracking-card';
import DoNotSellCard from './do-not-sell-card';
import DpaCard from './dpa-card';
import UsageInformationCard from './usage-information-card';

export default function Privacy() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Privacy' ) }
					description={ __( 'Manage your privacy settings and data usage preferences.' ) }
				/>
			}
		>
			<VStack spacing={ 8 }>
				<UsageInformationCard />
				{ config.isEnabled( 'me/email-tracking-consent' ) && <EmailTrackingCard /> }
				<DpaCard />
				{ config.isEnabled( 'cookie-banner' ) && <DoNotSellCard /> }
			</VStack>
		</PageLayout>
	);
}
