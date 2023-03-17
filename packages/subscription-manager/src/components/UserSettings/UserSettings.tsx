import { Reader } from '@automattic/data-stores';
import { EmailFormatInput } from '../fields/EmailFormatInput';

type UserSettingsProps = {
	value?: Reader.SubscriptionManagerUserSettings;
	onChange?: ( value: Reader.SubscriptionManagerUserSettings ) => void;
	loading?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- until we start using any of these props
const UserSettings = ( { value = {}, loading = false, onChange }: UserSettingsProps ) => (
	<div className="user-settings">
		<EmailFormatInput
			value={ value.mail_option ?? 'html' }
			onChange={ ( value ) => onChange?.( { mail_option: value } ) }
		/>
	</div>
);

export default UserSettings;
