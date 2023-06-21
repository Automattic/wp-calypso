import { Reader } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';

const FilterBy = Reader.SubscribersFilterBy;

const useSubscribersFilterOptions = () => {
	const translate = useTranslate();
	return useMemo(
		() => [
			{ value: FilterBy.All, label: translate( 'All' ) },
			{ value: FilterBy.Paid, label: translate( 'Paid' ) },
			{ value: FilterBy.Free, label: translate( 'Free' ) },
		],
		[ translate ]
	);
};

export default useSubscribersFilterOptions;
