import { MembershipSubscription } from '@automattic/api-core';
import { monetizeSubscriptionsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useResizeObserver } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate, type View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { adjustDataViewFieldsForWidth } from '../../utils/dataviews-width';
import { useMembershipsFieldDefinitions } from './dataviews';
import { getMonetizeSubscriptionsPageTitle, getMonetizeSubscriptionUrl } from './urls';

const defaultPerPage = 10;

const membershipsDesktopFields = [ 'status' ];
const membershipsMobileFields: string[] = [];

const membershipDataView: View = {
	type: 'table',
	page: 1,
	perPage: defaultPerPage,
	titleField: 'product',
	showTitle: true,
	mediaField: 'site',
	showMedia: true,
	descriptionField: 'description',
	showDescription: true,
	fields: membershipsDesktopFields,
	sort: {
		field: 'product',
		direction: 'desc',
	},
	layout: {},
};

function MonetizeSubscriptions() {
	const [ currentView, setView ] = useState( membershipDataView );
	const ref = useResizeObserver( ( entries ) => {
		const firstEntry = entries[ 0 ];
		if ( firstEntry ) {
			adjustDataViewFieldsForWidth( {
				width: firstEntry.contentRect.width,
				setView,
				wideFields: membershipsDesktopFields,
				desktopFields: membershipsDesktopFields,
				mobileFields: membershipsMobileFields,
			} );
		}
	} );

	const membershipsDataFields = useMembershipsFieldDefinitions();
	const { data: monetizeSubscriptions, isLoading: isLoadingMemberships } = useQuery(
		monetizeSubscriptionsQuery()
	);
	const navigate = useNavigate();

	const actions = useMemo(
		() => [
			{
				id: 'manage-purchase',
				label: __( 'Manage purchase' ),
				isEligible: ( item: MembershipSubscription ) => Boolean( item.ID ),
				callback: ( items: MembershipSubscription[] ) => {
					const subscriptionId = items[ 0 ].ID;
					if ( ! subscriptionId ) {
						// eslint-disable-next-line no-console
						console.error( 'Cannot display manage purchase page for subscription without ID' );
						return;
					}
					navigate( {
						to: getMonetizeSubscriptionUrl( subscriptionId ),
					} );
				},
			},
		],
		[ navigate ]
	);

	const { data: adjustedMemberships, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( monetizeSubscriptions ?? [], currentView, membershipsDataFields );
	}, [ monetizeSubscriptions, currentView, membershipsDataFields ] );

	const getItemId = ( item: MembershipSubscription ) => {
		return item.ID;
	};

	return (
		<PageLayout
			size="large"
			header={ <PageHeader title={ getMonetizeSubscriptionsPageTitle() } /> }
		>
			<div ref={ ref }>
				<DataViewsCard>
					<DataViews
						data={ adjustedMemberships }
						isLoading={ isLoadingMemberships }
						fields={ membershipsDataFields }
						view={ currentView }
						onChangeView={ setView }
						defaultLayouts={ { table: {} } }
						actions={ actions }
						getItemId={ getItemId }
						paginationInfo={ paginationInfo }
					/>
				</DataViewsCard>
			</div>
		</PageLayout>
	);
}

export default MonetizeSubscriptions;
