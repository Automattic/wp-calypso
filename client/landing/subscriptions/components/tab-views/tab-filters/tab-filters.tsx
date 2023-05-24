import { SiteSubscriptionsFilterBy } from '@automattic/data-stores/src/reader/queries';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { Option } from 'calypso/landing/subscriptions/components/sort-controls';

export const useFilterOptions = () => {
	const translate = useTranslate();

	return useMemo(
		() => [
			{ value: SiteSubscriptionsFilterBy.All, label: translate( 'All' ) },
			{ value: SiteSubscriptionsFilterBy.Paid, label: translate( 'Paid' ) },
			{ value: SiteSubscriptionsFilterBy.P2, label: translate( 'P2' ) },
		],
		[ translate ]
	);
};

export const getFilterLabel = (
	availableFilterOptions: Option[],
	filterValue: SiteSubscriptionsFilterBy
) => availableFilterOptions.find( ( option ) => option.value === filterValue )?.label;
