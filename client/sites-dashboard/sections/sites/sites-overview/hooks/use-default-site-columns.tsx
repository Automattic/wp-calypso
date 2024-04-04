import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { AllowedTypes, SiteColumns } from '../types';

type SiteColumn = {
	key: AllowedTypes;
	title: string;
	className?: string;
	isExpandable?: boolean;
	isSortable?: boolean;
	showInfo?: boolean;
};

const useDefaultSiteColumns = ( isLargeScreen = false ): SiteColumns => {
	const translate = useTranslate();
	const isBoostEnabled = isEnabled( 'jetpack/pro-dashboard-jetpack-boost' );
	const isPaidMonitorEnabled = isEnabled( 'jetpack/pro-dashboard-monitor-paid-tier' );
	const isWPCOMAtomicSiteCreationEnabled = isEnabled(
		'jetpack/pro-dashboard-wpcom-atomic-hosting'
	);

	return useMemo( () => {
		const boostColumn: SiteColumn[] = isBoostEnabled
			? [
					{
						key: 'boost',
						title: translate( 'Boost score' ),
						className: 'jetpack-cloud-site-column__boost',
						isExpandable: true,
						showInfo: true,
					},
			  ]
			: [];

		return [
			{
				key: 'site',
				title:
					isWPCOMAtomicSiteCreationEnabled && isLargeScreen
						? ( translate( '{{div}}Host{{/div}} Site', {
								components: {
									div: <div className="site-host-info" />,
								},
						  } ) as string )
						: translate( 'Site' ),
				isSortable: true,
			},
			{
				key: 'stats',
				title: translate( 'Stats' ),
				className: 'width-fit-content jetpack-cloud-site-column__stats',
				isExpandable: true,
			},
			...boostColumn,
			{
				key: 'backup',
				title: translate( 'Backup' ),
				className: 'fixed-site-column jetpack-cloud-site-column__backup',
				isExpandable: true,
				showInfo: true,
			},
			{
				key: 'scan',
				title: translate( 'Scan' ),
				className: 'fixed-site-column jetpack-cloud-site-column__scan',
				showInfo: true,
			},
			{
				key: 'monitor',
				title: translate( 'Monitor' ),
				className: 'min-width-100px jetpack-cloud-site-column__monitor',
				isExpandable: true,
				showInfo: isPaidMonitorEnabled,
			},
			{
				key: 'plugin',
				title: translate( 'Plugins' ),
				className: 'width-fit-content jetpack-cloud-site-column__plugin',
			},
		];
	}, [
		isBoostEnabled,
		isPaidMonitorEnabled,
		isWPCOMAtomicSiteCreationEnabled,
		translate,
		isLargeScreen,
	] );
};

export default useDefaultSiteColumns;
