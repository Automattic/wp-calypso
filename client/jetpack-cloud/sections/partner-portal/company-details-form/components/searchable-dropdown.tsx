import { Gridicon } from '@automattic/components';
import Select, { StylesConfig, DropdownIndicatorProps, components } from 'react-select';

interface Props {
	className?: string;
	value: object;
	options: object[];
	onChange: ( option: any ) => void;
	isDisabled?: boolean;
	isLoading?: boolean;
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
	singleValue: ( styles ) => ( { ...styles, color: 'var(--color-neutral-70)', fontWeight: 600 } ),
	indicatorSeparator: ( styles ) => ( { ...styles, display: 'none' } ),
	dropdownIndicator: ( styles ) => ( { ...styles, color: 'var(--color-neutral-50)' } ),
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
		/>
	);
};

export default SearchableDropdown;
