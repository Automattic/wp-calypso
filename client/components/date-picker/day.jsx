import { useEffect, useRef } from 'react';

const DatePickerDayButton = ( { day, modifiers, ...buttonProps } ) => {
	const ref = useRef( null );

	useEffect( () => {
		if ( modifiers.focused ) {
			ref.current?.focus();
		}
	}, [ modifiers.focused ] );

	return (
		<button ref={ ref } { ...buttonProps }>
			<div className="date-picker__day">{ day.date.getDate() }</div>
		</button>
	);
};

export default DatePickerDayButton;
