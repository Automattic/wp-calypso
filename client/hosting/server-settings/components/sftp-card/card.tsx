import { SftpForm } from 'calypso/sites/settings/sftp-ssh/sftp-form';

type SftpCardProps = {
	disabled?: boolean;
};

export const SftpCard = ( { disabled }: SftpCardProps ) => {
	return <SftpForm disabled={ disabled } />;
};
