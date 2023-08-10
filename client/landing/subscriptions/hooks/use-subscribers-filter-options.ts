import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { SubscribersFilterBy } from 'calypso/my-sites/subscribers/constants';

const FilterBy = SubscribersFilterBy;

const useSubscribersFilterOptions = () => {
	const translate = useTranslate();
	return useMemo(
		() => [
			{ value: FilterBy.All, label: translate( 'All' ) },
			{ value: FilterBy.Email, label: translate( 'Via Email' ) },
			{ value: FilterBy.WPCOM, label: translate( 'Via WordPress.com' ) },
		],
		[ translate ]
	);
};

export default useSubscribersFilterOptions;
