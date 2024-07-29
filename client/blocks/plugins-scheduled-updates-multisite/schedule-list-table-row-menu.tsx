import { DropdownMenu } from '@wordpress/components';
import { moreHorizontal } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { SiteSlug } from 'calypso/types';
import type {
	MultisiteSchedulesUpdates,
	MultisiteSiteDetails,
} from 'calypso/data/plugins/use-update-schedules-query';

type Props = {
	schedule: MultisiteSchedulesUpdates;
	onEditClick: ( id: string ) => void;
	onRemoveClick: ( id: string, siteSlug?: SiteSlug ) => void;
	onLogsClick: ( id: string, siteSlug: SiteSlug ) => void;
};

export const ScheduleListTableRowMenu = ( {
	schedule,
	site,
	onEditClick,
	onRemoveClick,
	onLogsClick,
}: Props & { site?: MultisiteSiteDetails } ) => {
	const translate = useTranslate();

	const items = [
		{
			title: translate( 'Edit' ),
			onClick: () => onEditClick( schedule.id ),
		},
	];

	if ( site ) {
		items.push( {
			title: translate( 'Logs' ),
			onClick: () => onLogsClick( schedule.schedule_id, site.slug ),
		} );
	}

	items.push( {
		title: translate( 'Remove' ),
		onClick: () => onRemoveClick( schedule.schedule_id, site?.slug ),
	} );

	return (
		<DropdownMenu
			popoverProps={ { position: 'bottom left' } }
			controls={ items }
			icon={ moreHorizontal }
			label={ translate( 'More' ) }
		/>
	);
};
