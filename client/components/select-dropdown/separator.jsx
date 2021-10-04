const stopPropagation = ( event ) => event.stopPropagation();

export default function SelectDropdownSeparator() {
	return (
		<li onClick={ stopPropagation } role="presentation" className="select-dropdown__separator" />
	);
}
