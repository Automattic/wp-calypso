import { FormEvent } from 'react';
import { BlockEmailsSetting } from '../fields/BlockEmailsSetting';
import {
	DeliveryWindowInput,
	DeliveryWindowDayType,
	DeliveryWindowHourType,
} from '../fields/DeliveryWindowInput';
import { EmailFormatInput, EmailFormatType } from '../fields/EmailFormatInput';

type SubscriptionUserSettings = Partial< {
	mail_option: EmailFormatType;
	delivery_day: DeliveryWindowDayType; // 0-6, 0 is Sunday
	delivery_hour: DeliveryWindowHourType; // 0-23, 0 is midnight
	blocked: boolean;
	email: string;
} >;

type UserSettingsProps = {
	value?: SubscriptionUserSettings;
	onChange?: ( value: SubscriptionUserSettings ) => void;
	loading?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- until we start using any of these props
const UserSettings = ( { value = {}, loading = false, onChange }: UserSettingsProps ) => (
	<div className="user-settings">
		<EmailFormatInput
			value={ value.mail_option ?? 'html' }
			onChange={ ( evt: FormEvent< HTMLSelectElement > ) =>
				onChange?.( { mail_option: evt.currentTarget.value as EmailFormatType } )
			}
		/>
		<DeliveryWindowInput
			dayValue={ value.delivery_day ?? 0 }
			hourValue={ value.delivery_hour ?? 0 }
			onDayChange={ ( evt: FormEvent< HTMLSelectElement > ) =>
				onChange?.( { delivery_day: parseInt( evt.currentTarget.value ) as DeliveryWindowDayType } )
			}
			onHourChange={ ( evt: FormEvent< HTMLSelectElement > ) =>
				onChange?.( {
					delivery_hour: parseInt( evt.currentTarget.value ) as DeliveryWindowHourType,
				} )
			}
		/>
		<BlockEmailsSetting
			value={ value.blocked }
			onChange={ ( value ) => onChange?.( { blocked: !! value.target.value } ) }
		/>
	</div>
);

export default UserSettings;
