import { arrowDown, arrowUp, Icon } from '@wordpress/icons';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { Card, ShortenedNumber, formattedNumber } from '../';
import Popover from '../popover';

export type HighlightCardProps = {
	count: number | null;
	heading: React.ReactNode;
	icon: React.ReactNode;
	onClick?: ( event: MouseEvent ) => void;
	previousCount?: number | null;
	showValueTooltip?: boolean | null;
};

function subtract( a: number | null, b: number | null | undefined ): number | null {
	return a === null || b === null || b === undefined ? null : a - b;
}

export function percentCalculator( part: number | null, whole: number | null ) {
	if ( part === null || whole === null ) {
		return null;
	}
	// Handle NaN case.
	if ( part === 0 && whole === 0 ) {
		return 0;
	}
	const answer = ( part / whole ) * 100;
	// Handle Infinities.
	return Math.abs( answer ) === Infinity ? 100 : Math.round( answer );
}

export default function HighlightCard( {
	count,
	previousCount,
	icon,
	heading,
	showValueTooltip,
}: HighlightCardProps ) {
	const difference = subtract( count, previousCount );
	const percentage = Number.isFinite( difference )
		? percentCalculator( Math.abs( difference as number ), count )
		: null;
	const textRef = useRef( null );
	const [ isTooltipVisible, setTooltipVisible ] = useState( false );
	return (
		<Card className="highlight-card">
			<div className="highlight-card-icon">{ icon }</div>
			<div className="highlight-card-heading">{ heading }</div>
			<div
				className="highlight-card-count"
				onMouseEnter={ () => setTooltipVisible( true ) }
				onMouseLeave={ () => setTooltipVisible( false ) }
			>
				<span
					className="highlight-card-count-value"
					title={ Number.isFinite( count ) ? String( count ) : undefined }
					ref={ textRef }
				>
					<ShortenedNumber value={ count } />
				</span>{ ' ' }
				{ difference !== null ? (
					<span
						className={ classNames( 'highlight-card-difference', {
							'highlight-card-difference--positive': difference < 0,
							'highlight-card-difference--negative': difference > 0,
						} ) }
					>
						<span className="highlight-card-difference-icon" title={ String( difference ) }>
							{ difference < 0 && <Icon size={ 18 } icon={ arrowDown } /> }
							{ difference > 0 && <Icon size={ 18 } icon={ arrowUp } /> }
						</span>
						<span className="highlight-card-difference-absolute-value">
							{ Math.abs( difference ) }
						</span>
						{ percentage !== null && (
							<span className="highlight-card-difference-absolute-percentage">
								{ ' ' }
								({ percentage }%)
							</span>
						) }
					</span>
				) : null }
				{ showValueTooltip && (
					<Popover
						className="tooltip tooltip--darker highlight-card-tooltip"
						isVisible={ isTooltipVisible }
						position="bottom right"
						context={ textRef.current }
					>
						<div className="highlight-card-tooltip-content">
							<span className="highlight-card-tooltip-label">
								<span className="highlight-card-tooltip-icon">{ icon }</span>
								<span>{ heading }</span>
							</span>
							<span>{ formattedNumber( count ) }</span>
						</div>
					</Popover>
				) }
			</div>
		</Card>
	);
}
