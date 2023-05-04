import NavigationArrows from '../navigation-arrows';

type SubscribersNavigationProps = {
	date: Date;
	period: keyof typeof periodFunctions;
	quantity: number;
	onDateChange: ( newDate: Date ) => void;
};

const isPast = ( date: Date ): boolean => {
	const incomingNextDate = new Date( date );
	incomingNextDate.setDate( incomingNextDate.getDate() + 1 );
	incomingNextDate.setHours( 0, 0, 0, 0 );

	const today = new Date();
	today.setHours( 0, 0, 0, 0 );

	return incomingNextDate.getTime() < today.getTime();
};

const periodFunctions = {
	day: ( date: Date, quantity: number ) => date.setDate( date.getDate() + quantity ),
	week: ( date: Date, quantity: number ) => date.setDate( date.getDate() + quantity * 7 ),
	month: ( date: Date, quantity: number ) => date.setMonth( date.getMonth() + quantity ),
	year: ( date: Date, quantity: number ) => date.setFullYear( date.getFullYear() + quantity ),
};

const calculateDate = (
	add: boolean,
	date: Date,
	period: keyof typeof periodFunctions,
	quantity: number
): Date => {
	const operation = add ? 1 : -1;
	periodFunctions[ period ]?.( date, quantity * operation );

	return date;
};

const SubscribersNavigation = ( {
	date,
	period,
	quantity,
	onDateChange,
}: SubscribersNavigationProps ) => {
	const handleArrowNext = () => {
		let newDate = date;

		newDate = calculateDate( true, date, period, quantity );

		// if the calculated date is future date due to swapping periods - cut off with today
		onDateChange( isPast( newDate ) ? newDate : new Date() );
	};

	const handleArrowPrevious = () => {
		let newDate = date;

		newDate = calculateDate( false, date, period, quantity );

		onDateChange( newDate );
	};

	const disableNextArrow = ! isPast( date ); // disable tomorrow
	const disablePreviousArrow = false; // allow all previous dates

	return (
		<NavigationArrows
			className="subscribers-section-heading__chart-controls--arrows"
			disableNextArrow={ disableNextArrow }
			disablePreviousArrow={ disablePreviousArrow }
			onClickNext={ handleArrowNext }
			onClickPrevious={ handleArrowPrevious }
		/>
	);
};

export { SubscribersNavigation as default, isPast, calculateDate };
