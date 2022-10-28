import { Icon, trendingDown, trendingUp } from '@wordpress/icons';
import classNames from 'classnames';
import { Card } from '../';

export type HighlightCardProps = {
	count: number | null;
	heading: React.ReactNode;
	icon: React.ReactNode;
	onClick?: () => void;
	previousCount?: number | null;
};

function subtract( a: number | null, b: number | null | undefined ): number | null {
	return a === null || b === null || b === undefined ? null : a - b;
}

function percent( part: number | null, whole: number | null ) {
	return part === null || whole === null ? null : Math.round( ( part / whole ) * 100 );
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
				{ Number.isFinite( count ) ? count : '-' }{ ' ' }
				{ difference !== null ? (
					<span
						className={ classNames( 'highlight-card-difference', {
							'highlight-card-difference--positive': difference < 0,
							'highlight-card-difference--negative': difference > 0,
						} ) }
					>
						{ difference < 0 && <Icon icon={ trendingDown } /> }
						{ difference > 0 && <Icon icon={ trendingUp } /> }
						{ Math.abs( difference ) }
						{ percentage !== null && <> ({ percentage }%)</> }
					</span>
				) : null }
			</div>
		</Card>
	);
}
