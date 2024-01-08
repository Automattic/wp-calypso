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

	const isMultiSiteLicenseSelectionEnabled = isEnabled( 'jetpack/multi-site-license-selection' );

	const isLicenseSelected = useSelector( ( state ) =>
		isMultiSiteLicenseSelectionEnabled
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
