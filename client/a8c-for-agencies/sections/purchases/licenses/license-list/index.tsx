import page from '@automattic/calypso-router';
import { PropsWithChildren, useContext, useCallback } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import useFetchLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-licenses';
import Pagination from 'calypso/components/pagination';
import LicenseListEmpty from 'calypso/jetpack-cloud/sections/partner-portal/license-list/empty'; // FIXME: Fix for A4A
import LicenseListHeader from 'calypso/jetpack-cloud/sections/partner-portal/license-list/header'; // FIXME: Fix for A4A
import { LicensePreviewPlaceholder } from 'calypso/jetpack-cloud/sections/partner-portal/license-preview';
import { LicenseType } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { addQueryArgs } from 'calypso/lib/route';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { LICENSES_PER_PAGE } from 'calypso/state/partner-portal/licenses/constants';
import LicensePreview from '../license-preview';
import LicensesOverviewContext from '../licenses-overview/context';

import './style.scss';

function setPage( pageNumber: number ): void {
	const queryParams = { page: pageNumber };
	const currentPath = window.location.pathname + window.location.search;

	page( addQueryArgs( queryParams, currentPath ) );
}

interface LicenseTransitionProps {
	key?: string;
	exit?: boolean;
}

const LicenseTransition = ( props: PropsWithChildren< LicenseTransitionProps > ) => (
	<CSSTransition { ...props } classNames="license-list__license-transition" timeout={ 150 } />
);

export default function LicenseList() {
	const dispatch = useDispatch();
	const { filter, search, sortField, sortDirection, currentPage } =
		useContext( LicensesOverviewContext );

	const { data, isFetching, status } = useFetchLicenses(
		filter,
		search,
		sortField,
		sortDirection,
		currentPage
	);
	const licenses = data?.items;

	const hasFetched = status === 'success';
	const showLicenses = hasFetched && ! isFetching && !! licenses;
	const showPagination = showLicenses && data.totalPages > 1;
	const showNoResults = hasFetched && ! isFetching && licenses?.length === 0;

	const onPageClick = useCallback(
		( pageNumber: number ) => {
			setPage( pageNumber );
			dispatch(
				recordTracksEvent( 'calypso_a4a_license_list_pagination_page_click', {
					page: pageNumber,
				} )
			);
		},
		[ dispatch ]
	);

	return (
		<div className="license-list">
			<TransitionGroup className="license-list__transition-group">
				{ ! showNoResults && (
					<LicenseTransition>
						<LicenseListHeader />
					</LicenseTransition>
				) }

				{ showLicenses &&
					licenses.map( ( license ) => (
						<LicenseTransition key={ license.licenseKey }>
							<LicensePreview
								parentLicenseId={ license.licenseId }
								licenseKey={ license.licenseKey }
								product={ license.product }
								blogId={ license.blogId }
								siteUrl={ license.siteUrl }
								hasDownloads={ license.hasDownloads }
								issuedAt={ license.issuedAt }
								attachedAt={ license.attachedAt }
								revokedAt={ license.revokedAt }
								licenseType={
									license.ownerType === LicenseType.Standard
										? LicenseType.Standard
										: LicenseType.Partner
								}
								quantity={ license.quantity }
								isChildLicense={ !! license.parentLicenseId }
							/>
						</LicenseTransition>
					) ) }

				{ isFetching && (
					<LicenseTransition>
						<LicensePreviewPlaceholder />
					</LicenseTransition>
				) }

				{ showPagination && (
					<LicenseTransition>
						<Pagination
							className="license-list__pagination"
							page={ currentPage }
							perPage={ LICENSES_PER_PAGE }
							total={ data.total }
							pageClick={ onPageClick }
						/>
					</LicenseTransition>
				) }

				{ showNoResults && (
					<LicenseTransition key={ filter } exit={ false }>
						<LicenseListEmpty filter={ filter } />
					</LicenseTransition>
				) }
			</TransitionGroup>
		</div>
	);
}
