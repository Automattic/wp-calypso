import { useMobileBreakpoint } from '@automattic/viewport-react';
import {
	__experimentalText as Text,
	__experimentalConfirmDialog as ConfirmDialog,
	Button,
	Card,
	CardBody,
	CardHeader,
} from '@wordpress/components';
import { Icon, arrowLeft, info } from '@wordpress/icons';
import { useState } from 'react';
import { ScheduleListCards } from './schedule-list-cards';
import { ScheduleListEmpty } from './schedule-list-empty';
import { ScheduleListTable } from './schedule-list-table';

import './styles.scss';

interface Props {
	onNavBack?: () => void;
	onCreateNewSchedule?: () => void;
}
export const ScheduleList = ( props: Props ) => {
	const { onNavBack, onCreateNewSchedule } = props;
	const isMobile = useMobileBreakpoint();
	const [ isConfirmOpen, setIsConfirmOpen ] = useState( false );

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
					<ScheduleListEmpty onCreateNewSchedule={ onCreateNewSchedule } />
				</CardBody>
				<CardBody>
					{ isMobile ? (
						<ScheduleListCards onRemoveClick={ () => setIsConfirmOpen( true ) } />
					) : (
						<ScheduleListTable onRemoveClick={ () => setIsConfirmOpen( true ) } />
					) }

					<Text as="p">
						<Icon className="icon-info" icon={ info } size={ 16 } />
						The current feature implementation only allows to set up two schedules.
					</Text>
				</CardBody>
			</Card>
		</>
	);
};
