import { Button } from '@automattic/components';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { useState, useCallback, useEffect } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import { FormEvent } from 'react';
import { EmailFormatInput, EmailFormatType } from '../fields';
import { BlockEmailsSetting } from '../fields/block-emails-setting';
import { DeliveryWindowInput } from '../fields/delivery-window-input';
import { Notice, NoticeState, NoticeType } from '../notice';
import './styles.scss';

type DeliveryWindowDayType = Reader.DeliveryWindowDayType;
type DeliveryWindowHourType = Reader.DeliveryWindowHourType;

type SubscriptionUserSettings = Partial< {
	mail_option: EmailFormatType;
	delivery_day: DeliveryWindowDayType;
	delivery_hour: DeliveryWindowHourType;
	blocked: boolean;
	email: string;
} >;

type UserSettingsProps = {
	value?: SubscriptionUserSettings;
};

const DEFAULT_VALUE = {};

const UserSettings = ( { value = DEFAULT_VALUE }: UserSettingsProps ) => {
	const [ formState, setFormState ] = useState( value );
	const { mutate, isLoading, isSuccess, error } = SubscriptionManager.useUserSettingsMutation();
	const [ notice, setNotice ] = useState< NoticeState | null >( null );

	useEffect( () => {
		// check if formState is empty object
		if ( value ) {
			setFormState( value );
		}
	}, [ value ] );

	useEffect( () => {
		if ( isSuccess ) {
			setNotice( { type: NoticeType.Success, message: translate( 'Settings saved' ) as string } );
		}
		if ( error ) {
			setNotice( { type: NoticeType.Error, message: error.message } );
		}
	}, [ error, isSuccess ] );

	const onChange = ( newState: Partial< SubscriptionUserSettings > ) => {
		setFormState( ( prevState ) => ( { ...prevState, ...newState } ) );
	};

	const onSubmit = useCallback( () => {
		mutate( formState );
	}, [ formState, mutate ] );

	return (
		<div className="user-settings">
			<Notice onClose={ () => setNotice( null ) } visible={ !! notice } type={ notice?.type }>
				{ notice?.message }
			</Notice>

			<EmailFormatInput
				value={ formState.mail_option ?? 'html' }
				onChange={ ( evt: FormEvent< HTMLSelectElement > ) =>
					onChange?.( { mail_option: evt.currentTarget.value as EmailFormatType } )
				}
			/>
			<DeliveryWindowInput
				dayValue={ formState.delivery_day ?? 0 }
				hourValue={ formState.delivery_hour ?? 0 }
				onDayChange={ ( evt: FormEvent< HTMLSelectElement > ) =>
					onChange?.( {
						delivery_day: parseInt( evt.currentTarget.value ) as DeliveryWindowDayType,
					} )
				}
				onHourChange={ ( evt: FormEvent< HTMLSelectElement > ) =>
					onChange?.( {
						delivery_hour: parseInt( evt.currentTarget.value ) as DeliveryWindowHourType,
					} )
				}
			/>
			<BlockEmailsSetting
				value={ formState.blocked ?? false }
				onChange={ ( value ) => onChange?.( { blocked: value.target.checked } ) }
			/>
			<Button className="user-settings__submit-button" disabled={ isLoading } onClick={ onSubmit }>
				{ translate( 'Save changes', {
					context: 'Save the subscription management user changes',
				} ) }
			</Button>
		</div>
	);
};

export default UserSettings;
