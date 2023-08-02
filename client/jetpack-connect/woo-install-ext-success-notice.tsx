import { removeQueryArgs } from '@wordpress/url';
import { localize, LocalizeProps } from 'i18n-calypso';
import page from 'page';
import Notice from 'calypso/components/notice';

const WooInstallExtSuccessNotice = ( { translate }: LocalizeProps ) => {
	return (
		<Notice
			className="jetpack-connect__woo-core-profiler-notice"
			status="is-success"
			showDismiss={ false }
			text={ translate( 'Extensions successfully installed!' ) }
			isCompact={ false }
			duration={ 6000 }
			onDismissClick={ () => {
				page.replace(
					removeQueryArgs(
						window.location.pathname + window.location.search,
						'installed_ext_success'
					)
				);
			} }
		/>
	);
};

export default localize( WooInstallExtSuccessNotice );
