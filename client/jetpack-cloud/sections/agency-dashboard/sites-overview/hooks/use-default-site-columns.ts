import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { SiteColumn } from '../types';

const useDefaultSiteColumns = (): SiteColumn[] => {
	const translate = useTranslate();

	return useMemo( () => {
		const isBoostEnabled = isEnabled( 'jetpack/pro-dashboard-jetpack-boost' );
		const boostColumn: SiteColumn = {
			key: 'boost',
			title: translate( 'Boost' ),
			className: 'width-fit-content',
			isExpandable: true,
		};

		return [
			{
				key: 'site',
				title: translate( 'Site' ),
				isSortable: true,
			},
			{
				key: 'stats',
				title: translate( 'Stats' ),
				className: 'width-fit-content',
				isExpandable: true,
			},
			...( isBoostEnabled ? [ boostColumn ] : [] ),
			{
				key: 'backup',
				title: translate( 'Backup' ),
				className: 'fixed-site-column',
				isExpandable: true,
			},
			{
				key: 'scan',
				title: translate( 'Scan' ),
				className: 'fixed-site-column',
			},
			{
				key: 'monitor',
				title: translate( 'Monitor' ),
				className: 'min-width-100px',
				isExpandable: true,
			},
			{
				key: 'plugin',
				title: translate( 'Plugins' ),
				className: 'width-fit-content',
			},
		];
	}, [ translate ] );
};

export default useDefaultSiteColumns;
