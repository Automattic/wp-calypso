import { Panel } from 'calypso/components/panel';
import { SftpForm } from './sftp-form';

export default function SftpSsh() {
	return (
		<Panel className="settings-sftp-ssh">
			<SftpForm />
		</Panel>
	);
}
