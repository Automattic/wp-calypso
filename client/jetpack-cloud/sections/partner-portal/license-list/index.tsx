import page from '@automattic/calypso-router';
import { PropsWithChildren, useContext, useCallback } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import QueryJetpackPartnerPortalLicenses from 'calypso/components/data/query-jetpack-partner-portal-licenses';
import Pagination from 'calypso/components/pagination';
import LicenseListEmpty from 'calypso/jetpack-cloud/sections/partner-portal/license-list/empty';
import LicenseListHeader from 'calypso/jetpack-cloud/sections/partner-portal/license-list/header';
import LicenseListContext from 'calypso/jetpack-cloud/sections/partner-portal/license-list-context';
import LicensePreview, {
	LicensePreviewPlaceholder,
} from 'calypso/jetpack-cloud/sections/partner-portal/license-preview';
import { LicenseType } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { addQueryArgs } from 'calypso/lib/route';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { LICENSES_PER_PAGE } from 'calypso/state/partner-portal/licenses/constants';
import {
	getPaginatedLicenses,
	hasFetchedLicenses,
	isFetchingLicenses,
} from 'calypso/state/partner-portal/licenses/selectors';
import { License, PaginatedItems } from 'calypso/state/partner-portal/types';
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
		useContext( LicenseListContext );
	const hasFetched = useSelector( hasFetchedLicenses );
	const isFetching = useSelector( isFetchingLicenses );
	const licenses = useSelector( getPaginatedLicenses ) as PaginatedItems< License >;
	const showLicenses = hasFetched && ! isFetching && !! licenses;
	const showPagination = showLicenses && licenses.totalPages > 1;
	const showNoResults = hasFetched && ! isFetching && licenses && licenses.items.length === 0;

	const onPageClick = useCallback(
		( pageNumber: number ) => {
			setPage( pageNumber );
			dispatch(
				recordTracksEvent( 'calypso_partner_portal_license_list_pagination_page_click', {
					page: pageNumber,
				} )
			);
		},
		[ dispatch ]
	);

	return (
		<div className="license-list">
			<QueryJetpackPartnerPortalLicenses
				filter={ filter }
				search={ search }
				sortField={ sortField }
				sortDirection={ sortDirection }
				page={ currentPage }
			/>

			<TransitionGroup className="license-list__transition-group">
				{ ! showNoResults && (
					<LicenseTransition>
						<LicenseListHeader />
					</LicenseTransition>
				) }

				{ showLicenses &&
					licenses.items.map( ( license ) => (
						<LicenseTransition key={ license.licenseKey }>
							<LicensePreview
								licenseKey={ license.licenseKey }
								product={ license.product }
								username={ license.username }
								blogId={ license.blogId }
								siteUrl={ license.siteUrl }
								hasDownloads={ license.hasDownloads }
								issuedAt={ license.issuedAt }
								attachedAt={ license.attachedAt }
								revokedAt={ license.revokedAt }
								filter={ filter }
								licenseType={
									license.ownerType === LicenseType.Standard
										? LicenseType.Standard
										: LicenseType.Partner
								}
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
							total={ licenses.totalItems }
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
