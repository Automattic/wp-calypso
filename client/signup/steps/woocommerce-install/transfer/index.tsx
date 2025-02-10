import config from '@automattic/calypso-config';
import { useState } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import InstallPlugins from './install-plugins';
import TransferSite from './transfer-site';
import type { WooCommerceInstallProps } from '../';
import './style.scss';

export interface FailureInfo {
	type: string;
	code: string;
	error: string;
}

export default function Transfer( props: WooCommerceInstallProps ) {
	const dispatch = useDispatch();
	// selectedSiteId is set by the controller whenever site is provided as a query param.
	const siteId = useSelector( getSelectedSiteId ) as number;
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );

	const {
		goToStep,
		signupDependencies: { siteConfirmed },
	} = props;

	const [ hasFailed, setHasFailed ] = useState( false );

	const handleTransferFailure = ( failureInfo: FailureInfo ) => {
		dispatch(
			recordTracksEvent( 'calypso_woocommerce_dashboard_snag_error', {
				action: failureInfo.type,
				site: domain,
				code: failureInfo.code,
				error: failureInfo.error,
			} )
		);

		logToLogstash( {
			feature: 'calypso_client',
			message: failureInfo.error,
			severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			blog_id: siteId,
			properties: {
				env: config( 'env_id' ),
				type: 'calypso_woocommerce_dashboard_snag_error',
				action: failureInfo.type,
				site: domain,
				code: failureInfo.code,
			},
		} );
		setHasFailed( true );
	};

	const trackRedirect = () => {
		dispatch( recordTracksEvent( 'calypso_woocommerce_dashboard_redirect' ) );
	};

	if ( siteConfirmed !== siteId ) {
		goToStep( 'confirm' );
		return null;
	}

	return (
		<StepWrapper
			className="transfer__step-wrapper"
			flowName="woocommerce-install"
			hideBack={ ! hasFailed }
			backUrl={ `/woocommerce-installation/${ domain }` }
			hideNext
			hideSkip
			hideFormattedHeader
			isWideLayout
			stepContent={
				<>
					{ isAtomic && (
						<InstallPlugins onFailure={ handleTransferFailure } trackRedirect={ trackRedirect } />
					) }
					{ ! isAtomic && (
						<TransferSite onFailure={ handleTransferFailure } trackRedirect={ trackRedirect } />
					) }
				</>
			}
			{ ...props }
		/>
	);
}
