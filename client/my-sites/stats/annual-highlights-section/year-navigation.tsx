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
	const handleClickArrow = ( next?: boolean ) => {
		// eslint-disable-next-line no-console
		// console.log( 'handleClickArrow' );
		const arrow = next ? 'next' : 'previous';
		recordGoogleEvent( 'Stats Period Navigation', `Clicked ${ arrow } year` );

		onYearChange( next );
	};

	return (
		<NavigationArrows
			disableNextArrow={ disableNextArrow }
			disablePreviousArrow={ disablePreviousArrow }
			handleClickArrow={ handleClickArrow }
		/>
	);
};

export default YearNavigation;
