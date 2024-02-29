import { useMobileBreakpoint } from '@automattic/viewport-react';
import {
	__experimentalText as Text,
	__experimentalConfirmDialog as ConfirmDialog,
	Button,
	Card,
	CardBody,
	CardHeader,
	Spinner,
} from '@wordpress/components';
import { Icon, arrowLeft, info } from '@wordpress/icons';
import { useState } from 'react';
import { useScheduleUpdatesQuery } from 'calypso/data/plugins/use-schedule-updates-query';
import { ScheduleListCards } from './schedule-list-cards';
import { ScheduleListEmpty } from './schedule-list-empty';
import { ScheduleListTable } from './schedule-list-table';
import type { SiteSlug } from 'calypso/types';

interface Props {
	siteSlug: SiteSlug;
	onNavBack?: () => void;
	onCreateNewSchedule?: () => void;
}
export const ScheduleList = ( props: Props ) => {
	const MAX_SCHEDULES = 2;
	const isMobile = useMobileBreakpoint();

	const { siteSlug, onNavBack, onCreateNewSchedule } = props;
	const [ isConfirmOpen, setIsConfirmOpen ] = useState( false );
	const { data: schedules = [], isFetching, isFetched } = useScheduleUpdatesQuery( siteSlug );

	const closeConfirm = () => {
		setIsConfirmOpen( false );
	};

	return (
		<>
			<ConfirmDialog isOpen={ isConfirmOpen } onConfirm={ closeConfirm } onCancel={ closeConfirm }>
				Are you sure you want to delete this schedule?
			</ConfirmDialog>
			<Card className="plugins-update-manager">
				<CardHeader size="extraSmall">
					<div className="ch-placeholder">
						{ onNavBack && (
							<Button icon={ arrowLeft } onClick={ onNavBack }>
								Back
							</Button>
						) }
					</div>
					<Text>Schedules</Text>
					<div className="ch-placeholder"></div>
				</CardHeader>
				<CardBody>
					{ isFetching && <Spinner /> }
					{ isFetched && schedules.length === 0 && (
						<ScheduleListEmpty onCreateNewSchedule={ onCreateNewSchedule } />
					) }
					{ isFetched && schedules.length > 0 && (
						<>
							{ isMobile ? (
								<ScheduleListCards onRemoveClick={ () => setIsConfirmOpen( true ) } />
							) : (
								<ScheduleListTable onRemoveClick={ () => setIsConfirmOpen( true ) } />
							) }
						</>
					) }
					{ isFetched && schedules.length >= MAX_SCHEDULES && (
						<Text as="p">
							<Icon className="icon-info" icon={ info } size={ 16 } />
							The current feature implementation only allows to set up two schedules.
						</Text>
					) }
				</CardBody>
			</Card>
		</>
	);
};
