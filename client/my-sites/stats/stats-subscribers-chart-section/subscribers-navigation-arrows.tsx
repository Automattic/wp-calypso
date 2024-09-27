import NavigationArrows from '../components/navigation-arrows';

type SubscribersNavigationProps = {
	date: Date;
	period: keyof typeof addQuantityToDate;
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

const addQuantityToDate = {
	day: ( date: Date, daysToBeAdded: number ) => date.setDate( date.getDate() + daysToBeAdded ),
	week: ( date: Date, daysToBeAdded: number ) => date.setDate( date.getDate() + daysToBeAdded * 7 ),
	month: ( date: Date, daysToBeAdded: number ) => date.setMonth( date.getMonth() + daysToBeAdded ),
	year: ( date: Date, daysToBeAdded: number ) =>
		date.setFullYear( date.getFullYear() + daysToBeAdded ),
};

const calculateDate = (
	date: Date,
	period: keyof typeof addQuantityToDate,
	quantity: number
): Date => {
	addQuantityToDate[ period ]?.( date, quantity );
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

		newDate = calculateDate( date, period, quantity );

		// if the calculated date is future date due to swapping periods - cut off with today
		onDateChange( isPast( newDate ) ? newDate : new Date() );
	};

	const handleArrowPrevious = () => {
		let newDate = date;

		newDate = calculateDate( date, period, -quantity );

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
