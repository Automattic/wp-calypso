import { Icon, arrowRight, trendingDown, trendingUp } from '@wordpress/icons';
import classNames from 'classnames';
import { Card } from '../';

export type HighlightCardProps = {
	count: number | null;
	heading: React.ReactNode;
	icon: React.ReactNode;
	onClick?: ( event: MouseEvent ) => void;
	previousCount?: number | null;
};

function subtract( a: number | null, b: number | null | undefined ): number | null {
	return a === null || b === null || b === undefined ? null : a - b;
}

function percent( part: number | null, whole: number | null ) {
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

const FORMATTER = new Intl.NumberFormat( 'en-GB', {
	notation: 'compact',
	compactDisplay: 'short',
} );
function formatNumber( number: number | null ) {
	return Number.isFinite( number ) ? FORMATTER.format( number as number ) : '-';
}

export default function HighlightCard( {
	count,
	previousCount,
	icon,
	heading,
}: HighlightCardProps ) {
	const difference = subtract( count, previousCount );
	const percentage = Number.isFinite( difference )
		? percent( Math.abs( difference as number ), count )
		: null;
	return (
		<Card className="highlight-card">
			<div className="highlight-card-icon">{ icon }</div>
			<div className="highlight-card-heading">{ heading }</div>
			<div className="highlight-card-count">
				<span
					className="highlight-card-count-value"
					title={ Number.isFinite( count ) ? String( count ) : undefined }
				>
					{ formatNumber( count ) }
				</span>{ ' ' }
				{ difference !== null ? (
					<span
						className={ classNames( 'highlight-card-difference', {
							'highlight-card-difference--positive': difference < 0,
							'highlight-card-difference--negative': difference > 0,
						} ) }
					>
						<span className="highlight-card-difference-icon" title={ String( difference ) }>
							{ difference < 0 && <Icon icon={ trendingDown } /> }
							{ difference === 0 && <Icon icon={ arrowRight } /> }
							{ difference > 0 && <Icon icon={ trendingUp } /> }
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
			</div>
		</Card>
	);
}
