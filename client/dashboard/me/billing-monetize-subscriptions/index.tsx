import { MonetizeSubscription } from '@automattic/api-core';
import { monetizeSubscriptionsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useResizeObserver } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate, type View } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { monetizeSubscriptionRoute } from '../../app/router/me';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { adjustDataViewFieldsForWidth } from '../../utils/dataviews-width';
import { useMonetizeFieldDefinitions } from './dataviews';
import { getMonetizeSubscriptionsPageTitle } from './title';

const defaultPerPage = 10;

const monetizeDesktopFields = [ 'status' ];
const monetizeMobileFields: string[] = [];

const monetizeDataView: View = {
	type: 'table',
	page: 1,
	perPage: defaultPerPage,
	titleField: 'product',
	showTitle: true,
	mediaField: 'site',
	showMedia: true,
	descriptionField: 'description',
	showDescription: true,
	fields: monetizeDesktopFields,
	sort: {
		field: 'product',
		direction: 'desc',
	},
	layout: {},
};

function MonetizeSubscriptions() {
	const [ currentView, setView ] = useState( monetizeDataView );
	const ref = useResizeObserver( ( entries ) => {
		const firstEntry = entries[ 0 ];
		if ( firstEntry ) {
			adjustDataViewFieldsForWidth( {
				width: firstEntry.contentRect.width,
				setView,
				wideFields: monetizeDesktopFields,
				desktopFields: monetizeDesktopFields,
				mobileFields: monetizeMobileFields,
			} );
		}
	} );

	const monetizeDataFields = useMonetizeFieldDefinitions();
	const { data: monetizeSubscriptions, isLoading: isLoadingMonetize } = useQuery(
		monetizeSubscriptionsQuery()
	);
	const navigate = useNavigate();

	const actions = useMemo(
		() => [
			{
				id: 'manage-purchase',
				label: __( 'Manage purchase' ),
				isEligible: ( item: MonetizeSubscription ) => Boolean( item.ID ),
				callback: ( items: MonetizeSubscription[] ) => {
					const subscriptionId = items[ 0 ].ID;
					if ( ! subscriptionId ) {
						// eslint-disable-next-line no-console
						console.error( 'Cannot display manage purchase page for subscription without ID' );
						return;
					}
					navigate( {
						to: monetizeSubscriptionRoute.fullPath,
						params: { subscriptionId: subscriptionId },
					} );
				},
			},
		],
		[ navigate ]
	);

	const { data: adjustedMonetizeSubscriptions, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( monetizeSubscriptions ?? [], currentView, monetizeDataFields );
	}, [ monetizeSubscriptions, currentView, monetizeDataFields ] );

	const getItemId = ( item: MonetizeSubscription ) => {
		return item.ID;
	};

	return (
		<PageLayout
			size="large"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ getMonetizeSubscriptionsPageTitle() }
					description={ __( 'Manage your Monetize subscriptions.' ) }
				/>
			}
		>
			<div ref={ ref }>
				<DataViewsCard>
					<DataViews
						data={ adjustedMonetizeSubscriptions }
						isLoading={ isLoadingMonetize }
						fields={ monetizeDataFields }
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
