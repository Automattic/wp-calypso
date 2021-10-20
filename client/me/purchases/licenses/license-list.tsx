import { Fragment } from 'react';
import Pagination from 'calypso/components/pagination';
import { useJetpackLicenseQuery } from 'calypso/data/jetpack-licenses';
import License from 'calypso/me/purchases/licenses/license';

const LicenseList: React.FunctionComponent = () => {
	const {
		data,
		status,
		// fetchNextPage,
		// isFetchingNextPage,
		// hasNextPage,
		// error,
		// refetch,
	} = useJetpackLicenseQuery();

	switch ( status ) {
		case 'idle':
			return <div>{ 'idle...' }</div>;
		case 'error':
			return <div>{ 'error' }</div>;
		case 'loading':
			return <div>{ '...loading' }</div>;
		case 'success':
			if ( data !== undefined ) {
				return (
					<div>
						<div>
							<Pagination />
						</div>
						{ data.pages.map( ( licenses, index ) => {
							return (
								<Fragment key={ index }>
									{ licenses.map( ( license ) => (
										<License
											key={ license.licenseId }
											licenseKey={ license.licenseKey }
											product={ license.product }
											issuedAt={ license.issuedAt }
										/>
									) ) }
								</Fragment>
							);
						} ) }
					</div>
				);
			}
			return <div>{ 'success' }</div>;
	}
};

export default LicenseList;
