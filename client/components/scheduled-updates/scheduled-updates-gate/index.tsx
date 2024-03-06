import { useTranslate } from 'i18n-calypso';
import { FC, ReactNode, FocusEvent, useState } from 'react';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import HostingActivateStatus from 'calypso/my-sites/hosting/hosting-activate-status';
import { useDispatch, useSelector } from 'calypso/state';
import { transferInProgress } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import UpsellNudgeNotice from './upsell-nudge';
import type { SiteId } from 'calypso/types';

import './style.scss';

interface ScheduledUpdatesGateProps {
	children: ReactNode;
	hasScheduledUpdatesFeature: boolean;
	isAtomic: boolean;
	isEligibleForFeature: boolean;
	siteId: SiteId;
}

const ScheduledUpdatesGate: FC< ScheduledUpdatesGateProps > = ( {
	children,
	hasScheduledUpdatesFeature,
	isAtomic,
	isEligibleForFeature,
	siteId,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const transferState = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );
	const [ hasTransfer, setHasTransferring ] = useState(
		!! (
			transferState &&
			transferInProgress.includes( transferState as ( typeof transferInProgress )[ number ] )
		)
	);

	const showHostingActivationBanner = ! isAtomic && ! hasTransfer;

	const handleFocus = ( e: FocusEvent< HTMLDivElement > ) => {
		e.target.blur();
	};

	const clickActivate = () => {
		dispatch( initiateThemeTransfer( siteId, null, '', '', 'scheduled_updates' ) );
		setHasTransferring( true );
	};

	const onTick = ( isTransferring?: boolean ) => {
		if ( isTransferring && ! hasTransfer ) {
			setHasTransferring( true );
		}
	};

	const getNoticeBanner = () => {
		if ( ! hasScheduledUpdatesFeature ) {
			return <UpsellNudgeNotice />;
		}

		if ( showHostingActivationBanner ) {
			return (
				<Notice
					className="scheduled-updates__activating-notice"
					status="is-info"
					showDismiss={ false }
					text={ translate( 'Please activate hosting access to begin using this feature.' ) }
					icon="globe"
				>
					<NoticeAction onClick={ clickActivate }>{ translate( 'Activate' ) }</NoticeAction>
				</Notice>
			);
		}
		return null;
	};

	if ( ! isEligibleForFeature ) {
		return (
			<div tabIndex={ -1 } className="scheduled-updates-gate" onFocus={ handleFocus }>
				{ getNoticeBanner() }
				{ ! showHostingActivationBanner && (
					<HostingActivateStatus
						context="hosting"
						onTick={ onTick }
						keepAlive={ ! isAtomic && hasTransfer }
					/>
				) }
				<div className="scheduled-updates-gate__content">{ children }</div>
			</div>
		);
	}
	return <div>{ children }</div>;
};

export default ScheduledUpdatesGate;
