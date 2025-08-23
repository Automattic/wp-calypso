import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import AppsCard from './apps-card';
import AppsDesktopCard from './apps-desktop-card';
import JetpackAppLogo from './jetpack-app-logo.svg';

function JetpackAppCard() {
	return (
		<AppsCard
			logo={ JetpackAppLogo }
			logoAlt={ __( 'Jetpack mobile app logo' ) }
			title={ __( 'Jetpack mobile app for WordPress' ) }
			description={ __( 'Create, design, manage, and grow your WordPress website.' ) }
		></AppsCard>
	);
}

export default function Apps() {
	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Apps' ) } /> }>
			<VStack spacing={ 8 }>
				<JetpackAppCard />
				<AppsDesktopCard appSlug="wordpress" />
				<AppsDesktopCard appSlug="studio" />
			</VStack>
		</PageLayout>
	);
}
