import { useDispatch, useSelector } from 'calypso/state';
import { selectLicense, unselectLicense } from 'calypso/state/jetpack-agency-dashboard/actions';
import { hasSelectedLicensesOfType } from 'calypso/state/jetpack-agency-dashboard/selectors';
import type { AllowedTypes } from '../../types';

const useDashboardAddRemoveLicense = ( siteId: number, type: AllowedTypes ) => {
	const dispatch = useDispatch();

	const isLicenseSelected = useSelector( ( state ) =>
		hasSelectedLicensesOfType( state, siteId, type )
	);

	const handleAddLicenseAction = () => {
		isLicenseSelected
			? dispatch( unselectLicense( siteId, type ) )
			: dispatch( selectLicense( siteId, type ) );
	};

	return { isLicenseSelected, handleAddLicenseAction };
};

export default useDashboardAddRemoveLicense;
