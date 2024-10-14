import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import NavigationArrows from '../../navigation-arrows';

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
		const arrow = next ? 'next' : 'previous';
		recordGoogleEvent( 'Stats Period Navigation', `Clicked ${ arrow } year` );
		onYearChange( next );
	};
	const handleArrowNext = () => {
		handleArrowEvent( true );
	};
	const handleArrowPrevious = () => {
		handleArrowEvent( false );
	};

	return (
		<NavigationArrows
			disableNextArrow={ disableNextArrow }
			disablePreviousArrow={ disablePreviousArrow }
			onClickNext={ handleArrowNext }
			onClickPrevious={ handleArrowPrevious }
		/>
	);
};

export default YearNavigation;
