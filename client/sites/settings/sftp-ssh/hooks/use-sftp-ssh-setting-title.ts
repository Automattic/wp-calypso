import { useTranslate } from 'i18n-calypso';
import useIsSshSettingSupported from './use-is-ssh-setting-supported';

export default function useSftpSshSettingTitle() {
	const translate = useTranslate();
	const isSshSupported = useIsSshSettingSupported();

	return isSshSupported ? translate( 'SFTP/SSH' ) : translate( 'SFTP' );
}
