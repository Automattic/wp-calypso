import type { ReactChild } from 'react';

type TranslateReturnType = ReactChild | string;

type OptionLike = {
	label: TranslateReturnType;
	value: string | number;
};

export function toSelectOption( { label, value }: OptionLike ) {
	return {
		label: String( label ),
		value: String( value ),
		disabled: ! value,
	};
}
