import { useI18n } from '@wordpress/react-i18n';
import { ComponentProps } from 'react';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { getDashboardUrl } from '../utils';

const VisitDashboardItem = ( { site }: { site: SiteExcerptData } ) => {
	const { __ } = useI18n();

	return (
		<PopoverMenuItem href={ getDashboardUrl( site.slug ) }>
			{ __( 'Visit Dashboard' ) }
		</PopoverMenuItem>
	);
};

export const SitesEllipsisMenu = ( {
	className,
	...props
}: ComponentProps< typeof VisitDashboardItem > & { className?: string } ) => {
	return (
		<EllipsisMenu className={ className }>
			<VisitDashboardItem { ...props } />
		</EllipsisMenu>
	);
};
