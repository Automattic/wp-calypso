import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { SubscribersFilterBy } from 'calypso/my-sites/subscribers/constants';

const FilterBy = SubscribersFilterBy;

const useSubscribersFilterOptions = ( newDropdownOptionsReady: boolean ) => {
	const translate = useTranslate();
	const newDropdownOptions = useMemo(
		() => [
			{ value: FilterBy.All, label: translate( 'All' ) },
			{ value: FilterBy.Email, label: translate( 'Via Email' ) },
			{ value: FilterBy.WPCOM, label: translate( 'Via WordPress.com' ) },
		],
		[ translate ]
	);
	const oldDropdownOptions = useMemo(
		() => [
			{ value: FilterBy.All, label: translate( 'All' ) },
			{ value: FilterBy.Email, label: translate( 'Email subscriber' ) },
			{ value: FilterBy.WPCOM, label: translate( 'Follower' ) },
		],
		[ translate ]
	);

	if ( newDropdownOptionsReady ) {
		return newDropdownOptions;
	}
	return oldDropdownOptions;
};

export default useSubscribersFilterOptions;
