type OptionLike = {
	label: string;
	value: string;
};

export function toSelectOption( { label, value }: OptionLike ) {
	return {
		label: String( label ),
		value: String( value ),
		disabled: ! value,
	};
}
