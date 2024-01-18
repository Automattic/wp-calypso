import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import { useAtomicTransferQuery } from 'calypso/state/atomic-transfer/use-atomic-transfer-query';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

interface HostingActivateStatusProps {
	context: 'theme' | 'plugin' | 'hosting';
	siteId: number | null;
}

const HostingActivateStatus = ( { context, siteId }: HostingActivateStatusProps ) => {
	const { isTransferring, transferStatus } = useAtomicTransferQuery( siteId, {
		refetchInterval: 5000,
	} );

	const getLoadingText = () => {
		switch ( context ) {
			case 'theme':
				return translate( 'Please wait while we activate the theme features.' );
			case 'plugin':
				return translate( 'Please wait while we activate the plugin features.' );
			default:
				return translate( 'Please wait while we activate the hosting features.' );
		}
	};

	if ( transferStatus === transferStates.ERROR ) {
		return (
			<Notice
				status="is-error"
				showDismiss={ false }
				text={ translate( 'There was an error activating hosting features.' ) }
				icon="bug"
			/>
		);
	}

	if ( isTransferring ) {
		return (
			<Notice
				className="hosting__activating-notice"
				status="is-info"
				showDismiss={ false }
				text={ getLoadingText() }
				icon="sync"
			/>
		);
	}
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );

	return {
		siteId,
		siteSlug,
	};
};

const mapDispatchToProps = {
	initiateTransfer: initiateThemeTransfer,
};

export default connect( mapStateToProps, mapDispatchToProps )( HostingActivateStatus );
