import { ReactElement, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import InstallPlugins from './install-plugins';
import TransferSite from './transfer-site';
import type { WooCommerceInstallProps } from '../';
import './style.scss';

export default function Transfer( props: WooCommerceInstallProps ): ReactElement | null {
	const dispatch = useDispatch();
	// selectedSiteId is set by the controller whenever site is provided as a query param.
	const siteId = useSelector( getSelectedSiteId ) as number;
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );

	const {
		goToStep,
		signupDependencies: { siteConfirmed },
	} = props;

	const [ hasFailed, setHasFailed ] = useState( false );

	const handleTransferFailure = () => {
		dispatch( recordTracksEvent( 'calypso_woocommerce_dashboard_snag_error' ) );
		setHasFailed( true );
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
			hideNext={ true }
			hideSkip={ true }
			hideFormattedHeader={ true }
			isWideLayout={ props.isReskinned }
			stepContent={
				<>
					{ isAtomic && <InstallPlugins onFailure={ handleTransferFailure } /> }
					{ ! isAtomic && <TransferSite onFailure={ handleTransferFailure } /> }
				</>
			}
			{ ...props }
		/>
	);
}
