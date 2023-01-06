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
		const arrow = next ? 'next' : 'previous';
		recordGoogleEvent( 'Stats Period Navigation', `Clicked ${ arrow } year` );

		onYearChange( next );
	};

	const onKeyDown = ( event: React.KeyboardEvent< HTMLButtonElement >, next?: boolean ) => {
		if ( event.key === 'Enter' || event.key === 'Space' ) {
			handleClickArrow( next );
		}
	};

	return (
		<NavigationArrows
			disableNextArrow={ disableNextArrow }
			disablePreviousArrow={ disablePreviousArrow }
			handleClickArrow={ handleClickArrow }
			onKeyDown={ onKeyDown }
		/>
	);
};

export default YearNavigation;
