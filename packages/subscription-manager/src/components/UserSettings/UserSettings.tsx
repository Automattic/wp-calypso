import { FormEvent } from 'react';
import { BlockEmailsSetting } from '../fields/BlockEmailsSetting';
import { EmailFormatInput, EmailFormatType } from '../fields/EmailFormatInput';

type SubscriptionUserSettings = Partial< {
	mail_option: EmailFormatType;
	delivery_day: number; // 0-6, 0 is Sunday
	delivery_hour: number; // 0-23, 0 is midnight
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
		<BlockEmailsSetting
			value={ value.blocked }
			onChange={ ( value ) => onChange?.( { blocked: !! value.target.value } ) }
		/>
	</div>
);

export default UserSettings;
