import { ReactElement, useState } from 'react';
import { useSelector } from 'react-redux';
import StepWrapper from 'calypso/signup/step-wrapper';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import InstallPlugins from './install-plugins';
import TransferSite from './transfer-site';
import type { WooCommerceInstallProps } from '../';
import './style.scss';

export default function Transfer( props: WooCommerceInstallProps ): ReactElement | null {
	// selectedSiteId is set by the controller whenever site is provided as a query param.
	const siteId = useSelector( getSelectedSiteId ) as number;
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );

	const {
		goToStep,
		signupDependencies: { siteConfirmed },
	} = props;

	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );
	const [ hasFailed, setHasFailed ] = useState( false );

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
			backUrl={ hasFailed ? `/woocommerce-installation/${ domain }` : null }
			stepContent={
				<>
					{ isAtomic && <InstallPlugins /> }
					{ ! isAtomic && <TransferSite onFailure={ () => setHasFailed( true ) } /> }
				</>
			}
			{ ...props }
		/>
	);
}
