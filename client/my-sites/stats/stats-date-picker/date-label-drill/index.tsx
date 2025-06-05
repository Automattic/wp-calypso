import { Popover } from '@automattic/components';
import { Icon, levelUp } from '@wordpress/icons';
import { useState, useEffect, ReactNode, useRef } from 'react';
import './index.scss';

interface DateLabelDrillProps {
	children: ReactNode;
	previousDisplayDate: string;
}

const DateLabelDrill = ( { children, previousDisplayDate }: DateLabelDrillProps ) => {
	const [ isAnimated, setIsAnimated ] = useState( false );
	const elementRef = useRef< HTMLDivElement >( null );
	const [ isTooltipVisible, setIsTooltipVisible ] = useState( false );

	useEffect( () => {
		setIsAnimated( true );
	}, [] );

	const goBack = () => {
		window.history.back();
		// Prevent multiple drill-up actions.
		sessionStorage.removeItem( 'jetpack_stats_date_range_is_drilling_down' );
		sessionStorage.setItem(
			'jetpack_stats_date_range_is_drilling_down_date_history',
			JSON.stringify( [ previousDisplayDate ] )
		);
	};

	return (
		<div
			className={ `date-label-drill ${ isAnimated ? 'date-label-drill--is-animated' : '' }` }
			onMouseEnter={ () => setIsTooltipVisible( true ) }
			onMouseLeave={ () => setIsTooltipVisible( false ) }
		>
			<Icon className="gridicon" icon={ levelUp } onClick={ goBack } ref={ elementRef } />
			{ children }
			{ previousDisplayDate && (
				<Popover
					className="tooltip tooltip--darker"
					isVisible={ isTooltipVisible }
					position="top right"
					context={ elementRef.current }
					hideArrow
				>
					{ previousDisplayDate }
				</Popover>
			) }
		</div>
	);
};

export default DateLabelDrill;
