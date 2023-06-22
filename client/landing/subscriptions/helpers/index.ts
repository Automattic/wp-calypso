import type { Option } from 'calypso/landing/subscriptions/components/sort-controls';

export const getOptionLabel = < T >( options: Option< T >[], value: T ) =>
	options.find( ( option ) => option.value === value )?.label;
