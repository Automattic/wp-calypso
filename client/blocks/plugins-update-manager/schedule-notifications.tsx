import {
	__experimentalText as Text,
	Button,
	Card,
	CardBody,
	CardHeader,
	Flex,
	FlexItem,
} from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { ScheduleNotificationsUsers } from './schedule-notifications-users';

import './forms.scss';

type Props = {
	onNavBack?: () => void;
};

export const ScheduleNotifications = ( { onNavBack }: Props ) => {
	const translate = useTranslate();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const onUsersChange = useCallback( ( userIds: number[] ) => {}, [] );

	return (
		<Card className="plugins-update-manager">
			<CardHeader size="extraSmall">
				<div className="ch-placeholder">
					{ onNavBack && (
						<Button icon={ arrowLeft } onClick={ onNavBack }>
							{ translate( 'Back' ) }
						</Button>
					) }
				</div>
				<Text>{ translate( 'Manage notifications' ) }</Text>
				<div className="ch-placeholder"></div>
			</CardHeader>
			<CardBody>
				<form
					id="notifications"
					className="notification-form"
					onSubmit={ ( e ) => {
						e.preventDefault();
					} }
				>
					<Flex
						className="schedule-form"
						direction={ [ 'column', 'row' ] }
						expanded={ true }
						align="start"
						gap={ 12 }
					>
						<FlexItem>
							<ScheduleNotificationsUsers onChange={ onUsersChange } />
						</FlexItem>
					</Flex>
				</form>
			</CardBody>
		</Card>
	);
};
