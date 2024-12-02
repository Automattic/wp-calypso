import { HostingCard, HostingCardDescription } from 'calypso/components/hosting-card';
import PhpMyAdminForm from 'calypso/sites/tools/database/form';

type PhpMyAdminCardProps = {
	disabled?: boolean;
};

export default function PhpMyAdminCard( { disabled }: PhpMyAdminCardProps ) {
	return (
		<PhpMyAdminForm
			ContainerComponent={ HostingCard }
			DescriptionComponent={ HostingCardDescription }
			disabled={ disabled }
		/>
	);
}
