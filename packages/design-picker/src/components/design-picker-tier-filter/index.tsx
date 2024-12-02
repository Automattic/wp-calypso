import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSearchParams } from 'react-router-dom';
import './style.scss';

const DesignPickerTierFilter = () => {
	const translate = useTranslate();
	const [ searchParams, setSearchParams ] = useSearchParams();

	const isFreeOnly = searchParams.get( 'tier' ) === 'free';

	const handleChange = ( value: boolean ) => {
		setSearchParams( ( currentSearchParams: any ) => {
			if ( value ) {
				currentSearchParams.set( 'tier', 'free' );
			} else {
				currentSearchParams.delete( 'tier' );
			}

			return currentSearchParams;
		} );
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
