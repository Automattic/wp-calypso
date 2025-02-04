import { TranslateResult } from 'i18n-calypso';

type OptionLike = {
	label: TranslateResult;
	value: string | number;
};

export function toSelectOption( { label, value }: OptionLike ) {
	return {
		label: String( label ),
		value: String( value ),
		disabled: ! value,
	};
}
