import { HostingCard, HostingCardDescription } from 'calypso/components/hosting-card';
import WebServerSettingsForm from 'calypso/sites/settings/web-server/web-server-form';

type WebServerSettingsCardProps = {
	disabled?: boolean;
};

export default function WebServerSettingsCard( { disabled }: WebServerSettingsCardProps ) {
	return (
		<WebServerSettingsForm
			ContainerComponent={ HostingCard }
			DescriptionComponent={ HostingCardDescription }
			disabled={ disabled }
		/>
	);
}
