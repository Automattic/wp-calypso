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

const useDefaultSiteColumns = (): SiteColumns => {
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
						isExpandable: true,
						showInfo: true,
					},
			  ]
			: [];

		return [
			{
				key: 'site',
				title: isWPCOMAtomicSiteCreationEnabled
					? ( translate( '{{div}}Host{{/div}} Site', {
							components: {
								div: <div className="fixed-host-column" />,
							},
					  } ) as string )
					: translate( 'Site' ),
				isSortable: true,
			},
			{
				key: 'stats',
				title: translate( 'Stats' ),
				className: 'width-fit-content',
				isExpandable: true,
			},
			...boostColumn,
			{
				key: 'backup',
				title: translate( 'Backup' ),
				className: 'fixed-site-column',
				isExpandable: true,
				showInfo: true,
			},
			{
				key: 'scan',
				title: translate( 'Scan' ),
				className: 'fixed-site-column',
				showInfo: true,
			},
			{
				key: 'monitor',
				title: translate( 'Monitor' ),
				className: 'min-width-100px',
				isExpandable: true,
				showInfo: isPaidMonitorEnabled,
			},
			{
				key: 'plugin',
				title: translate( 'Plugins' ),
				className: 'width-fit-content',
			},
		];
	}, [ isBoostEnabled, isPaidMonitorEnabled, isWPCOMAtomicSiteCreationEnabled, translate ] );
};

export default useDefaultSiteColumns;
