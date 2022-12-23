import { Icon, arrowLeft, arrowRight } from '@wordpress/icons';
import classNames from 'classnames';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

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
		<div className={ classNames( 'stats-period-navigation', 'stats-year-navigation' ) }>
			<button
				className={ classNames(
					'stats-period-navigation__previous',
					disablePreviousArrow && 'is-disabled'
				) }
				onClick={ disablePreviousArrow ? undefined : () => handleClickArrow() }
				onKeyDown={ disablePreviousArrow ? undefined : ( e ) => onKeyDown( e ) }
				tabIndex={ ! disablePreviousArrow ? 0 : -1 }
			>
				<Icon className="gridicon" icon={ arrowLeft } />
			</button>
			<button
				className={ classNames(
					'stats-period-navigation__next',
					disableNextArrow && 'is-disabled'
				) }
				onClick={ disableNextArrow ? undefined : () => handleClickArrow( true ) }
				onKeyDown={ disableNextArrow ? undefined : ( e ) => onKeyDown( e, true ) }
				tabIndex={ ! disableNextArrow ? 0 : -1 }
			>
				<Icon className="gridicon" icon={ arrowRight } />
			</button>
		</div>
	);
};

export default YearNavigation;
