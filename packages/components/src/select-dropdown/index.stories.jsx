import SelectDropdown from '.';

export default { component: SelectDropdown, title: 'Unaudited/SelectDropdown' };

const Template = ( args ) => {
	return <SelectDropdown { ...args } />;
};

export const Default = Template.bind( {} );
Default.args = {
	ariaLabel: 'select-dropdown-aria-label',
	className: 'select-dropdown',
	compact: false,
	disabled: false,
	isLoading: false,
	// eslint-disable-next-line no-console
	onToggle: () => console.log( 'Toggled' ),
	onSelect: ( { label } ) => {
		// eslint-disable-next-line no-console
		console.log( `${ label } Dropdown item selected` );
	},
	initialSelected: 'pikachu',
	options: [
		{ value: 'pikachu', label: 'Pikachu' },
		{ value: 'charmander', label: 'Charmander' },
		{ value: 'bulbasaur', label: 'Bulbasaur' },
	],
};
