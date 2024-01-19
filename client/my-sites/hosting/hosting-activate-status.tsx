import { translate } from 'i18n-calypso';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import { useAtomicTransferQuery } from 'calypso/state/atomic-transfer/use-atomic-transfer-query';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';

interface HostingActivateStatusProps {
	context: 'themes' | 'plugins' | 'hosting';
	siteId: number;
}

const HostingActivateStatus = ( { context, siteId }: HostingActivateStatusProps ) => {
	const { isTransferring, transferStatus } = useAtomicTransferQuery( siteId, {
		refetchInterval: 5000,
	} );

	const getLoadingText = () => {
		switch ( context ) {
			case 'themes':
				return translate( 'Please wait while we activate the themes features.' );
				break;
			case 'plugins':
				return translate( 'Please wait while we activate the plugins features.' );
				break;
			default:
				return translate( 'Please wait while we activate the hosting features.' );
		}
	};

	const getErrorText = () => {
		switch ( context ) {
			case 'themes':
				return translate( 'There was an error activating themes features.' );
				break;
			case 'plugins':
				return translate( 'There was an error activating plugins features.' );
				break;
			default:
				return translate( 'There was an error activating hosting features.' );
		}
	};

	if ( transferStatus === transferStates.ERROR ) {
		return <Notice status="is-error" showDismiss={ false } text={ getErrorText() } icon="bug" />;
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

const mapStateToProps = ( state: AppState ) => {
	const siteId = getSelectedSiteId( state ) || 0;
	const siteSlug = getSelectedSiteSlug( state );

	return {
		siteId,
		siteSlug,
	};
};

export default connect( mapStateToProps )( HostingActivateStatus );
