import NavigationArrows from '../navigation-arrows';

type SubscribersNavigationProps = {
	date: Date;
	period: string;
	quantity: number;
	onDateChange: ( newDate: Date ) => void;
};

const SubscribersNavigation = ( {
	date,
	period,
	quantity,
	onDateChange,
}: SubscribersNavigationProps ) => {
	const isFuture = ( date: Date ): boolean => {
		const incomingNextDate = new Date( date );
		incomingNextDate.setDate( incomingNextDate.getDate() + 1 );
		incomingNextDate.setHours( 0, 0, 0, 0 );

		const today = new Date();
		today.setHours( 0, 0, 0, 0 );

		return incomingNextDate.getTime() >= today.getTime();
	};

	const calculateDate = ( add: boolean ): Date => {
		switch ( period ) {
			case 'day':
				date.setDate( add ? date.getDate() + quantity : date.getDate() - quantity );
				return date;
			case 'week':
				date.setDate( add ? date.getDate() + quantity * 7 : date.getDate() - quantity * 7 );
				return date;
			case 'month':
				date.setMonth( add ? date.getMonth() + quantity : date.getMonth() - quantity );
				return date;
			case 'year':
				date.setFullYear( add ? date.getFullYear() + quantity : date.getFullYear() - quantity );
				return date;
			default:
				return date;
		}
	};

	const handleArrowNext = () => {
		let newDate = date;

		newDate = calculateDate( true );

		// if the calculated date is future date due to swapping periods - cut off with today
		onDateChange( ! isFuture( newDate ) ? newDate : new Date() );
	};
	const handleArrowPrevious = () => {
		let newDate = date;

		newDate = calculateDate( false );

		onDateChange( newDate );
	};

	const disableNextArrow = isFuture( date ); // disable tomorrow
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

export default SubscribersNavigation;
