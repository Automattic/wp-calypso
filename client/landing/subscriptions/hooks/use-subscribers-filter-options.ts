import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { SubscribersFilterBy } from 'calypso/my-sites/subscribers/constants';

const FilterBy = SubscribersFilterBy;

const useSubscribersFilterOptions = ( skipAllOption: boolean, siteId: number | null ) => {
	const translate = useTranslate();

	const options = skipAllOption ? [] : [ { value: FilterBy.All, label: translate( 'All' ) } ];
	options.push(
		{ value: FilterBy.Email, label: translate( 'Via Email' ) },
		{ value: FilterBy.WPCOM, label: translate( 'Via WordPress.com' ) }
	);

	return useMemo( () => options, [ translate, siteId ] );
};

export default useSubscribersFilterOptions;
