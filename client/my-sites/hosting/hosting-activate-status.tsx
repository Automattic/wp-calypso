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
import './style.scss';

interface HostingActivateStatusProps {
	context: 'theme' | 'plugin' | 'hosting';
	siteId: number | null;
	keepAlive?: boolean;
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

	const getErrorText = () => {
		switch ( context ) {
			case 'theme':
				return translate( 'There was an error activating theme features.' );
			case 'plugin':
				return translate( 'There was an error activating plugin features.' );
			default:
				return translate( 'There was an error activating hosting features.' );
		}
	};

	if ( transferStatus === transferStates.ERROR ) {
		return <Notice status="is-error" showDismiss={ false } text={ getErrorText() } icon="bug" />;
	}

	if ( isTransferCompleted ) {
		return null;
	}

	if ( isTransferring || keepAlive ) {
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
