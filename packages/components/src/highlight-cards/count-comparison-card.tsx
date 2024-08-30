import { arrowDown, arrowUp, Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { Card } from '../';
import importedFormatNumber, {
	DEFAULT_LOCALE,
	STANDARD_FORMATTING_OPTIONS,
	COMPACT_FORMATTING_OPTIONS,
} from '../number-formatters/lib/format-number';
import Popover from '../popover';

type CountComparisonCardProps = {
	count: number | null;
	heading?: React.ReactNode;
	icon?: React.ReactNode;
	onClick?: ( event: MouseEvent ) => void;
	previousCount?: number | null;
	showValueTooltip?: boolean | null;
	note?: string;
	compact?: boolean;
};

function formatNumber( number: number | null, isShortened = true, showSign = false ) {
	const option = isShortened
		? { ...COMPACT_FORMATTING_OPTIONS }
		: { ...STANDARD_FORMATTING_OPTIONS };
	if ( showSign ) {
		option.signDisplay = 'exceptZero';
	}
	return importedFormatNumber( number, DEFAULT_LOCALE, option );
}

function subtract( a: number | null, b: number | null | undefined ): number | null {
	return a === null || b === null || b === undefined ? null : a - b;
}

export function percentCalculator( part: number | null, whole: number | null | undefined ) {
	if ( part === null || whole === null || whole === undefined ) {
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

type TrendComparisonProps = {
	count: number | null;
	previousCount?: number | null;
};

export function TrendComparison( { count, previousCount }: TrendComparisonProps ) {
	const difference = subtract( count, previousCount );
	const percentage = Number.isFinite( difference )
		? percentCalculator( Math.abs( difference as number ), previousCount )
		: null;

	// Show nothing if inputs are invalid or if there is no change.
	if ( difference === null || difference === 0 ) {
		return null;
	}

	return (
		<span
			className={ clsx( 'highlight-card-difference', {
				'highlight-card-difference--positive': difference < 0,
				'highlight-card-difference--negative': difference > 0,
			} ) }
		>
			<span className="highlight-card-difference-icon">
				{ difference < 0 && <Icon size={ 18 } icon={ arrowDown } /> }
				{ difference > 0 && <Icon size={ 18 } icon={ arrowUp } /> }
			</span>
			{ percentage !== null && (
				<span className="highlight-card-difference-absolute-percentage"> { percentage }%</span>
			) }
		</span>
	);
}

function TooltipContent( { count, previousCount, icon, heading }: CountComparisonCardProps ) {
	if ( previousCount ) {
		const difference = subtract( count, previousCount ) as number;
		return (
			<div className="highlight-card-tooltip-content">
				<div className="highlight-card-tooltip-counts">
					{ formatNumber( count, false ) }
					{ '  ' }
					{ difference !== 0 && difference !== null && (
						<span className="highlight-card-tooltip-count-difference">
							({ formatNumber( difference, false, true ) })
						</span>
					) }
				</div>
			</div>
		);
	}

	return (
		<div className="highlight-card-tooltip-content">
			<span className="highlight-card-tooltip-label">
				{ icon && <span className="highlight-card-tooltip-icon">{ icon }</span> }
				{ heading && <span className="highlight-card-tooltip-heading">{ heading }</span> }
			</span>
			<span className="highlight-card-tooltip-counts">{ formatNumber( count ) }</span>
		</div>
	);
}

export default function CountComparisonCard( {
	count,
	previousCount,
	icon,
	heading,
	showValueTooltip,
	note = '',
	compact = false,
}: CountComparisonCardProps ) {
	const textRef = useRef( null );
	const [ isTooltipVisible, setTooltipVisible ] = useState( false );

	return (
		<Card className="highlight-card" compact={ compact }>
			{ icon && <div className="highlight-card-icon">{ icon }</div> }
			{ heading && <div className="highlight-card-heading">{ heading }</div> }
			<div
				className={ clsx( 'highlight-card-count', {
					'is-pointer': showValueTooltip,
				} ) }
				onMouseEnter={ () => setTooltipVisible( true ) }
				onMouseLeave={ () => setTooltipVisible( false ) }
			>
				<span className="highlight-card-count-value" ref={ textRef }>
					{ formatNumber( count ) }
				</span>{ ' ' }
				<TrendComparison count={ count } previousCount={ previousCount } />
				{ showValueTooltip && (
					<Popover
						className="tooltip tooltip--darker highlight-card-tooltip"
						isVisible={ isTooltipVisible }
						position="bottom right"
						context={ textRef.current }
					>
						<TooltipContent
							count={ count }
							previousCount={ previousCount }
							icon={ icon }
							heading={ heading }
						/>
						{ note && <div className="highlight-card-tooltip-note">{ note }</div> }
					</Popover>
				) }
			</div>
		</Card>
	);
}
