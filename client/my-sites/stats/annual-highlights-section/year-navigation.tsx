import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import NavigationArrows from '../navigation-arrows';

import './style.scss';

type YearNavigationProps = {
	onYearChange: ( next?: boolean ) => void;
	disablePreviousArrow: boolean;
	disableNextArrow: boolean;
};

const YearNavigation = ( {
	onYearChange,
	disablePreviousArrow,
	disableNextArrow,
}: YearNavigationProps ) => {
	const handleArrowEvent = ( next: boolean ) => {
		// eslint-disable-next-line no-console
		// console.log( 'handleArrowEvent' );
		const arrow = next ? 'next' : 'previous';
		recordGoogleEvent( 'Stats Period Navigation', `Clicked ${ arrow } year` );
		onYearChange( next );
	};
	const handleArrowNext = () => {
		// eslint-disable-next-line no-console
		// console.log( 'handleArrowNext' );
		handleArrowEvent( true );
	};
	const handleArrowPrevious = () => {
		// eslint-disable-next-line no-console
		// console.log( 'handleArrowPrevious' );
		handleArrowEvent( false );
	};

	return (
		<NavigationArrows
			disableNextArrow={ disableNextArrow }
			disablePreviousArrow={ disablePreviousArrow }
			onArrowNext={ handleArrowNext }
			onArrowPrevious={ handleArrowPrevious }
		/>
	);
};

export default YearNavigation;
