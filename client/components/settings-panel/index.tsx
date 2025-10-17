import { ToggleControl, __experimentalVStack as VStack } from '@wordpress/components';

export interface SettingsOption {
	id: string;
	label: string;
	value: boolean;
}

interface Props {
	options: SettingsOption[];
	onChange?: ( updated: SettingsOption ) => void;
	disabled?: boolean;
}
export const SettingsPanel = ( { options, onChange, disabled }: Props ) => {
	const handleChange = ( item: SettingsOption ) => {
		onChange?.( item );
	};

	return (
		<VStack alignment="start" spacing={ 8 }>
			<VStack spacing={ 4 }>
				{ options.map( ( item ) => (
					<ToggleControl
						disabled={ disabled }
						__nextHasNoMarginBottom
						className="stream-settings__toggle"
						key={ item.id }
						label={ item.label }
						checked={ item.value }
						onChange={ ( value ) => handleChange( { ...item, value } ) }
					/>
				) ) }
			</VStack>
		</VStack>
	);
};
