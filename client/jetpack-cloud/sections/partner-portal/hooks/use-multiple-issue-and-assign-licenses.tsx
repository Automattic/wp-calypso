import { useState } from 'react';
import useAssignLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-assign-license-mutation';
import useIssueLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-issue-license-mutation';

const useMultipleIssueAndAssignLicenses = () => {
	const { mutateAsync } = useIssueLicenseMutation( {
		retry: () => {
			return false;
		},
	} );

	const assignLicense = useAssignLicenseMutation( {
		retry: () => {
			return false;
		},
	} );

	const [ status, setStatus ] = useState( [] );

	const handleSetStatus = ( siteId: number, type: string, status: string, slug: string ) => {
		setStatus( ( prevStatus ) => {
			// filter siteId and slug
			const newStatus = prevStatus.filter(
				( item ) => ! ( item.siteId === siteId && item.slug === slug )
			);
			return [
				...newStatus,
				{
					siteId,
					type,
					status,
					slug,
				},
			];
		} );
	};

	const issueAndAssign = ( selectedLicenses ) => {
		const requests = selectedLicenses.map(
			( { slug, siteId }: { slug: string; siteId: number } ) => {
				handleSetStatus( siteId, 'issue-license', 'loading', slug );
				return mutateAsync( { product: slug, quantity: 1 } )
					.then( ( value ) => {
						handleSetStatus( siteId, 'issue-license', 'success', slug );
						handleSetStatus( siteId, 'assign-license', 'loading', slug );
						const licenseId = value?.license_key;
						if ( licenseId ) {
							return assignLicense
								.mutateAsync( {
									licenseKey: licenseId,
									selectedSite: siteId,
								} )
								.then( () => {
									handleSetStatus( siteId, 'assign-license', 'success', slug );
								} )
								.catch( () => {
									handleSetStatus( siteId, 'assign-license', 'failed', slug );
								} );
						}
					} )
					.catch( () => {
						handleSetStatus( siteId, 'issue-license', 'failed', slug );
					} );
			}
		);

		return Promise.all( requests );
	};

	return { issueAndAssign, status };
};

export default useMultipleIssueAndAssignLicenses;
