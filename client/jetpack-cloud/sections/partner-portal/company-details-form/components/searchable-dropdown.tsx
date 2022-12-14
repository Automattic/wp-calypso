import { Gridicon } from '@automattic/components';
import Select, { StylesConfig, DropdownIndicatorProps, components } from 'react-select';

interface Props {
	className?: string;
	value: object;
	options: object[];
	onChange: ( option: any ) => void;
	isDisabled?: boolean;
	isLoading?: boolean;
	placeholder: string;
}

const colourStyles: StylesConfig = {
	control: ( styles ) => ( {
		...styles,
		height: 40,
		borderRadius: 2,
		border: '1px solid var(--color-neutral-10)',
		color: 'green',
		padding: '0 8px 0 4px',
	} ),
	singleValue: ( styles ) => ( { ...styles, color: 'var(--color-neutral-70)' } ),
	indicatorSeparator: ( styles ) => ( { ...styles, display: 'none' } ),
	dropdownIndicator: ( styles ) => ( { ...styles, color: 'var(--color-neutral-50)' } ),
	placeholder: ( styles ) => ( { ...styles, color: 'var(--color-neutral-10)' } ),
};

const DropdownIndicator = ( props: DropdownIndicatorProps ) => (
	<components.DropdownIndicator { ...props }>
		<Gridicon icon="chevron-down" size={ 18 } />
	</components.DropdownIndicator>
);

const SearchableDropdown: React.FC< Props > = ( {
	className,
	value,
	options,
	onChange,
	isDisabled,
	isLoading,
	placeholder,
} ) => {
	return (
		<Select
			className={ className }
			value={ value }
			options={ options }
			isDisabled={ isDisabled }
			isLoading={ isLoading }
			onChange={ onChange }
			styles={ colourStyles }
			components={ { DropdownIndicator } }
			placeholder={ placeholder }
			theme={ ( theme: any ) => ( {
				...theme,
				borderRadius: 1,
				colors: {
					...theme.colors,
					primary25: 'var(--studio-gray-0)',
					primary: 'black',
				},
			} ) }
		/>
	);
};

export default SearchableDropdown;
