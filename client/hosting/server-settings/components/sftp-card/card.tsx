import { HostingCard, HostingCardDescription } from 'calypso/components/hosting-card';
import { SftpForm } from 'calypso/sites/tools/sftp-ssh/sftp-form';

type SftpCardProps = {
	disabled?: boolean;
};

export const SftpCard = ( { disabled }: SftpCardProps ) => {
	return (
		<SftpForm
			ContainerComponent={ HostingCard }
			DescriptionComponent={ HostingCardDescription }
			disabled={ disabled }
		/>
	);
};
