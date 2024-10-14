import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useLayoutEffect, useState } from 'react';
import { useSelector } from 'calypso/state';
import { isFetchingNotificationsSettings } from 'calypso/state/notification-settings/selectors';

type AllSitesProps =
	| { isApplyAllVisible: never | false }
	| { isApplyAllVisible: true; onSaveToAll(): void };

type NotificationSettingsFormActionsProps = {
	disabled: boolean;
	onSave(): void;
} & AllSitesProps;

const NotificationSettingsFormActions = ( {
	disabled,
	onSave,
	...props
}: NotificationSettingsFormActionsProps ) => {
	const translate = useTranslate();
	const isFetching = useSelector( isFetchingNotificationsSettings );
	const [ savingTarget, setSavingTarget ] = useState< 'single' | 'all' | null >( null );

	useLayoutEffect( () => {
		if ( ! isFetching ) {
			setSavingTarget( null );
		}
	}, [ isFetching ] );

	return (
		<div css={ { display: 'flex', gap: '16px', marginLeft: '10px', marginBottom: '10px' } }>
			<Button
				variant="primary"
				disabled={ disabled || !! isFetching }
				isBusy={ isFetching && savingTarget === 'single' }
				onClick={ () => {
					setSavingTarget( 'single' );
					onSave();
				} }
			>
				{ translate( 'Save settings' ) }
			</Button>

			{ props.isApplyAllVisible && (
				<Button
					variant="secondary"
					disabled={ disabled || !! isFetching }
					isBusy={ isFetching && savingTarget === 'all' }
					onClick={ () => {
						setSavingTarget( 'all' );
						props.onSaveToAll();
					} }
				>
					{ translate( 'Save to all sites' ) }
				</Button>
			) }
		</div>
	);
};

export default NotificationSettingsFormActions;
