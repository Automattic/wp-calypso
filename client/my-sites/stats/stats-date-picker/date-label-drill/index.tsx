import { Icon, levelUp } from '@wordpress/icons';
import { useState, useEffect, ReactNode } from 'react';
import './index.scss';

interface DateLabelDrillProps {
	children: ReactNode;
}

const DateLabelDrill = ( { children }: DateLabelDrillProps ) => {
	const [ isAnimated, setIsAnimated ] = useState( false );

	useEffect( () => {
		setIsAnimated( true );
		// Remove the flag after the drill-up action button is shown.
		sessionStorage.removeItem( 'jetpack_stats_date_range_is_drilling_down' );
	}, [] );

	const goBack = () => {
		window.history.back();
		// Prevent multiple drill-up actions.
		sessionStorage.removeItem( 'jetpack_stats_date_range_is_drilling_down' );
	};

	return (
		<div className={ `date-label-drill ${ isAnimated ? 'date-label-drill--is-animated' : '' }` }>
			<Icon className="gridicon" icon={ levelUp } onClick={ goBack } />
			{ children }
		</div>
	);
};

export default DateLabelDrill;
