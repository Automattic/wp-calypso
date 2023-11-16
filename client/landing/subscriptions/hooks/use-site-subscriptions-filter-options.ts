import { Reader } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';

const FilterBy = Reader.SiteSubscriptionsFilterBy;

const useSiteSubscriptionsFilterOptions = () => {
	const translate = useTranslate();
	return useMemo(
		() => [
			{ value: FilterBy.All, label: translate( 'All' ) },
			{ value: FilterBy.Paid, label: translate( 'Paid' ) },
			{ value: FilterBy.P2, label: translate( 'P2' ) },
			{ value: FilterBy.RSS, label: translate( 'RSS' ) },
		],
		[ translate ]
	);
};

export default useSiteSubscriptionsFilterOptions;
