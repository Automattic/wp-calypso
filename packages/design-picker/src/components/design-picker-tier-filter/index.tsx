import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useDesignPickerFilters } from '../../hooks/use-design-picker-filters';
import './style.scss';

interface Props {
	onChange?: ( value: boolean ) => void;
}

const DesignPickerTierFilter = ( { onChange }: Props ) => {
	const translate = useTranslate();

	const { selectedDesignTier, setSelectedDesignTier } = useDesignPickerFilters();

	const isFreeOnly = selectedDesignTier === 'free';

	const handleChange = ( value: boolean ) => {
		setSelectedDesignTier( value ? 'free' : '' );
		onChange?.( value );
	};

	return (
		<ToggleControl
			className="design-picker__tier-filter"
			__nextHasNoMarginBottom
			label={ translate( 'Free only' ) }
			checked={ isFreeOnly }
			onChange={ handleChange }
		/>
	);
};

export default DesignPickerTierFilter;
