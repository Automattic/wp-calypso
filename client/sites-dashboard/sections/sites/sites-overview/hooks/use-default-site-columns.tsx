import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { SiteColumns } from '../types';

const useDefaultSiteColumns = ( isLargeScreen = false ): SiteColumns => {
	const translate = useTranslate();

	return useMemo( () => {
		return [
			{
				key: 'site',
				title: isLargeScreen
					? ( translate( '{{div}}Host{{/div}} Site', {
							components: {
								div: <div className="site-host-info" />,
							},
					  } ) as string )
					: translate( 'Site' ),
				isSortable: true,
			},
			{
				key: 'plan',
				title: translate( 'Plan' ),
				className: 'width-fit-content jetpack-cloud-site-column__stats',
				isExpandable: false,
			},
			{
				key: 'type',
				title: translate( 'Type' ),
				className: 'fixed-site-column jetpack-cloud-site-column__backup',
				isExpandable: false,
				showInfo: true,
			},
			{
				key: 'last_publish',
				title: translate( 'Last Publish' ),
				className: 'fixed-site-column jetpack-cloud-site-column__scan',
				showInfo: true,
				isExpandable: false,
			},
			{
				key: 'stats',
				title: translate( 'Stats' ),
				className: 'min-width-100px jetpack-cloud-site-column__stats',
				isExpandable: false,
				showInfo: true,
			},
		];
	}, [ translate, isLargeScreen ] );
};

export default useDefaultSiteColumns;
