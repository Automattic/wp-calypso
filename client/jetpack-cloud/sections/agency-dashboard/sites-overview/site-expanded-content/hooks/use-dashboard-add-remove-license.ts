import { isEnabled } from '@automattic/calypso-config';
import { useDispatch, useSelector } from 'calypso/state';
import { selectLicense, unselectLicense } from 'calypso/state/jetpack-agency-dashboard/actions';
import {
	hasSelectedLicensesOfType,
	hasSelectedSiteLicensesOfType,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import type { AllowedTypes } from '../../types';

const useDashboardAddRemoveLicense = ( siteId: number, type: AllowedTypes ) => {
	const dispatch = useDispatch();

	const isStreamlinedPurchasesEnabled = isEnabled( 'jetpack/streamline-license-purchases' );

	const isLicenseSelected = useSelector( ( state ) =>
		isStreamlinedPurchasesEnabled
			? hasSelectedSiteLicensesOfType( state, siteId, type )
			: hasSelectedLicensesOfType( state, siteId, type )
	);

	const handleAddLicenseAction = () => {
		isLicenseSelected
			? dispatch( unselectLicense( siteId, type ) )
			: dispatch( selectLicense( siteId, type ) );
	};

	return { isLicenseSelected, handleAddLicenseAction };
};

export default useDashboardAddRemoveLicense;
