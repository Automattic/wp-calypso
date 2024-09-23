import { translate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import {
	TransferStates,
	transferInProgress,
	transferStates,
} from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';
import { activateContext } from './components/activate-context';
import { HostingErrorStatus } from './components/hosting-error-status';
import './style.scss';

interface HostingActivateStatusProps {
	context: activateContext;
	siteId: number | null;
	keepAlive?: boolean;
	forceEnable?: boolean;
	onTick?: (
		isTransferring?: boolean,
		wasTransferring?: boolean,
		isTransferCompleted?: boolean
	) => void;
}

const endStates: TransferStates[] = [
	transferStates.NONE,
	transferStates.COMPLETE,
	transferStates.COMPLETED,
	transferStates.FAILURE,
	transferStates.ERROR,
	transferStates.REVERTED,
	transferStates.NULL,
];

const HostingActivateStatus = ( {
	context,
	siteId,
	onTick,
	keepAlive,
	forceEnable,
}: HostingActivateStatusProps ) => {
	const transferStatus = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );

	const isTransferring =
		! endStates.includes( transferStatus as TransferStates ) &&
		transferStatus !== transferStates.INQUIRING;

	const dispatch = useDispatch();
	const isTransferCompleted = endStates.includes(
		transferStatus as ( typeof transferInProgress )[ number ]
	);
	const [ wasTransferring, setWasTransferring ] = useState( false );

	useEffect( () => {
		if ( isTransferring && ! wasTransferring ) {
			setWasTransferring( true );
		}
		if ( ! isTransferring && wasTransferring && isTransferCompleted ) {
			setWasTransferring( false );
		}
		if ( ! isTransferCompleted ) {
			dispatch( fetchAutomatedTransferStatus( siteId ?? 0 ) );
		}
		onTick?.( isTransferring, wasTransferring, isTransferCompleted );
	}, [ isTransferCompleted, isTransferring, onTick, wasTransferring ] );

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
		return <HostingErrorStatus context={ context } />;
	}

	if ( isTransferCompleted && ! forceEnable ) {
		return null;
	}

	if ( isTransferring || keepAlive || forceEnable ) {
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
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );

	return {
		siteId,
		siteSlug,
	};
};

const mapDispatchToProps = {
	initiateTransfer: initiateThemeTransfer,
	fetchAutomatedTransferStatus,
};

export default connect( mapStateToProps, mapDispatchToProps )( HostingActivateStatus );
