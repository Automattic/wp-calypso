import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import StepWrapper from 'calypso/signup/step-wrapper';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
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

	if ( siteId !== siteConfirmed ) {
		goToStep( 'confirm' );
		return null;
	}

	return (
		<StepWrapper
			className="transfer__step-wrapper"
			flowName="woocommerce-install"
			hideBack={ true }
			hideNext={ true }
			hideSkip={ true }
			hideFormattedHeader={ true }
			isWideLayout={ props.isReskinned }
			stepContent={
				<>
					{ isAtomic && <InstallPlugins /> }
					{ ! isAtomic && <TransferSite /> }
				</>
			}
			{ ...props }
		/>
	);
}
