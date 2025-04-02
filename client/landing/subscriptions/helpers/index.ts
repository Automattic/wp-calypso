import type { Option } from 'calypso/landing/subscriptions/components/sort-controls';

export const getOptionLabel = < T >( options: Option< T >[], value: T ) => {
	const foundOption = options.find( ( option ) => option.value === value )?.label;
	if ( ! foundOption ) {
		return options[ 0 ].label;
	}

	return foundOption;
};
