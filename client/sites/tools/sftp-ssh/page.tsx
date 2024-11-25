import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import { useAreAdvancedHostingFeaturesSupported } from '../../hosting-features/features';
import useSftpSshSettingTitle from './hooks/use-sftp-ssh-setting-title';
import { SftpCardLoadingPlaceholder } from './sftp-card-loading-placeholder';
import { SftpForm } from './sftp-form';

import './style.scss';

function Container( { isLoading, children }: { isLoading: boolean; children: React.ReactNode } ) {
	return isLoading ? <SftpCardLoadingPlaceholder /> : children;
}

function Description( { children }: { children?: React.ReactNode } ) {
	const title = useSftpSshSettingTitle();
	return <NavigationHeader title={ title } subtitle={ children } />;
}

export default function SftpSsh() {
	const translate = useTranslate();

	const isSupported = useAreAdvancedHostingFeaturesSupported();
	if ( isSupported === null ) {
		return null;
	}

	const renderNotSupportedNotice = () => {
		return (
			<>
				<Description />
				<Notice showDismiss={ false } status="is-warning">
					{ translate( 'This setting is not supported for this site.' ) }
				</Notice>
			</>
		);
	};

	const renderSetting = () => {
		return <SftpForm ContainerComponent={ Container } DescriptionComponent={ Description } />;
	};

	return (
		<div className="tools-sftp-ssh">
			{ isSupported ? renderSetting() : renderNotSupportedNotice() }
		</div>
	);
}
