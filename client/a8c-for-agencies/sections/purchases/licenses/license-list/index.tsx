import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { PropsWithChildren, useContext, useCallback } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import useFetchLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-licenses';
import Pagination from 'calypso/components/pagination';
import { LicensePreviewPlaceholder } from 'calypso/jetpack-cloud/sections/partner-portal/license-preview';
import { LicenseType } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { addQueryArgs } from 'calypso/lib/route';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { LICENSES_PER_PAGE } from 'calypso/state/partner-portal/licenses/constants';
import LicensePreview from '../license-preview';
import LicensesOverviewContext from '../licenses-overview/context';
import LicenseListEmpty from './empty';
import LicenseListHeader from './header';

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
	const translate = useTranslate();
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

	const getProductName = ( name: string ): string => {
		// For WordPress plans, we don't want to mention the specific plan.
		return name.startsWith( 'WordPress.com' ) ? translate( 'WordPress.com Site' ) : name;
	};

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
								license={ license }
								parentLicenseId={ license.licenseId }
								productName={ getProductName( license.product ) }
								licenseType={
									license.ownerType === LicenseType.Standard
										? LicenseType.Standard
										: LicenseType.Partner
								}
								quantity={ license.quantity }
								isChildLicense={ !! license.parentLicenseId }
								meta={ license.meta }
								referral={ license.referral }
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
