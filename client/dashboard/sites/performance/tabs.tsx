import { isEnabled } from '@automattic/calypso-config';
import { useRouter } from '@tanstack/react-router';
import { TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export type PerformanceTab = 'overview' | 'apm';

export function PerformanceTabs( {
	siteSlug,
	activeTab,
}: {
	siteSlug: string;
	activeTab: PerformanceTab;
} ) {
	const router = useRouter();

	if ( ! isEnabled( 'performance/apm' ) ) {
		return null;
	}

	const tabs = [
		{ name: 'overview', title: __( 'Overview' ) },
		{ name: 'apm', title: __( 'APM' ) },
	];

	return (
		<TabPanel
			tabs={ tabs }
			initialTabName={ activeTab }
			onSelect={ ( tabName ) => {
				if ( tabName === activeTab ) {
					return;
				}
				if ( tabName === 'overview' || tabName === 'apm' ) {
					router.navigate( { to: `/sites/${ siteSlug }/performance/${ tabName }` } );
				}
			} }
		>
			{ () => null }
		</TabPanel>
	);
}
