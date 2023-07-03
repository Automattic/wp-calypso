import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { SubscribersFilterBy } from 'calypso/my-sites/subscribers/constants';

const FilterBy = SubscribersFilterBy;

const useSubscribersFilterOptions = () => {
	const translate = useTranslate();
	return useMemo(
		() => [
			{ value: FilterBy.All, label: translate( 'All' ) },
			{ value: FilterBy.Email, label: translate( 'Email' ) },
			{ value: FilterBy.WPCOM, label: translate( 'WPCOM' ) },
		],
		[ translate ]
	);
};

export default useSubscribersFilterOptions;
