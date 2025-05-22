import { DayPicker } from 'react-day-picker';
import { enUS } from 'react-day-picker/locale';
import { COMMON_PROPS } from './utils/constants';
import { clampNumberOfMonths } from './utils/misc';
import { useControlledValue } from './utils/use-controlled-value';
import { useLocalizationProps } from './utils/use-localization-props';
import type { DateCalendarProps, OnSelectHandler } from './types';
import './styles.scss';

export const DateCalendar = ( {
	defaultSelected,
	selected: selectedProp,
	onSelect,
	numberOfMonths = 1,
	locale = enUS,
	timeZone,
	...props
}: DateCalendarProps ) => {
	const localizationProps = useLocalizationProps( {
		locale,
		timeZone,
		mode: 'single',
	} );

	const [ selected, setSelected ] = useControlledValue< Date | undefined >( {
		defaultValue: defaultSelected,
		value: selectedProp,
		onChange: onSelect as OnSelectHandler< Date | undefined >,
	} );

	return (
		<DayPicker
			{ ...COMMON_PROPS }
			{ ...localizationProps }
			{ ...props }
			mode="single"
			numberOfMonths={ clampNumberOfMonths( numberOfMonths ) }
			selected={ selected }
			onSelect={ setSelected }
		/>
	);
};
