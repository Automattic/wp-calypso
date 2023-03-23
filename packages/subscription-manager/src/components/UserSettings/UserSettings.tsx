import { Spinner } from '@automattic/components';
import { Reader } from '@automattic/data-stores';
import { useState, useCallback, useEffect } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import { FormEvent } from 'react';
import { Button } from '../Button';
import { BlockEmailsSetting } from '../fields/BlockEmailsSetting';
import { DeliveryWindowInput } from '../fields/DeliveryWindowInput';
import { EmailFormatInput, EmailFormatType } from '../fields/EmailFormatInput';
import type {
	DeliveryWindowDayType,
	DeliveryWindowHourType,
} from '@automattic/data-stores/src/reader/types';

type SubscriptionUserSettings = Partial< {
	mail_option: EmailFormatType;
	delivery_day: DeliveryWindowDayType; // 0-6, 0 is Sunday
	delivery_hour: DeliveryWindowHourType; // 0-23, 0 is midnight
	blocked: boolean;
	email: string;
} >;

type UserSettingsProps = {
	value?: SubscriptionUserSettings;
	loading: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- until we start using any of these props
const UserSettings = ( { value = {}, loading }: UserSettingsProps ) => {
	const [ formState, setFormState ] = useState< SubscriptionUserSettings >( value );
	const { mutate, isLoading } = Reader.useSubscriptionManagerUserSettingsMutation();

	useEffect( () => {
		// check if formState is empty object
		if ( value ) {
			setFormState( value );
		}
	}, [ value ] );

	const onChange = ( newState: Partial< SubscriptionUserSettings > ) => {
		setFormState( ( prevState ) => ( { ...prevState, ...newState } ) );
	};

	const onSubmit = useCallback( () => {
		mutate( formState );
	}, [ formState, mutate ] );

	if ( loading ) {
		return (
			<div className="user-settings">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="user-settings">
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
				onChange={ ( value ) => onChange?.( { blocked: !! value.target.value } ) }
			/>
			<Button disabled={ isLoading } onClick={ onSubmit }>
				{ translate( 'Save changes', {
					context: 'Save the subscription management user changes',
				} ) }
			</Button>
		</div>
	);
};

export default UserSettings;
