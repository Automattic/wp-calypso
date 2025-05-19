import { Button, CheckboxControl } from '@wordpress/components';
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
	const [ savingTarget, setSavingTarget ] = useState< 'single' | 'all' >( 'single' );

	useLayoutEffect( () => {
		if ( ! isFetching ) {
			setSavingTarget( 'single' );
		}
	}, [ isFetching ] );

	return (
		<div
			css={ {
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'start',
				gap: '16px',
				margin: '10px 0 16px 10px',
			} }
		>
			{ props.isApplyAllVisible && (
				<CheckboxControl
					__nextHasNoMarginBottom
					checked={ savingTarget === 'all' }
					disabled={ disabled || !! isFetching }
					label={ translate( 'Apply these settings to all my sites' ) }
					onChange={ ( checked ) => setSavingTarget( checked ? 'all' : 'single' ) }
				/>
			) }

			<Button
				variant="primary"
				disabled={ disabled || !! isFetching }
				isBusy={ isFetching && savingTarget === 'single' }
				onClick={ () => {
					if ( props.isApplyAllVisible && savingTarget === 'all' ) {
						props.onSaveToAll();
					} else {
						onSave();
					}
				} }
			>
				{ translate( 'Save settings' ) }
			</Button>
		</div>
	);
};

export default NotificationSettingsFormActions;
