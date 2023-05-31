import type { Option } from 'calypso/landing/subscriptions/components/sort-controls';

export const getOptionLabel = ( options: Option[], value: string ) =>
	options.find( ( option ) => option.value === value )?.label;
