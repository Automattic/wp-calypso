import { __ } from '@wordpress/i18n';
import RangePlot from '../../components/range-plot';

const COLOR_RANGE = 'var(--color-primary-0)';
const COLOR_YOU = 'var(--color-primary-50)';
const COLOR_A4A = 'var(--color-success-40)';
const COLOR_PEERS = 'var(--color-neutral-70)';

export default function PeerComparisonExample() {
	return (
		<section className="benchmarks-peer-comparison-example">
			<h2 className="benchmarks-peer-comparison-example__title">{ __( 'AI work involvement' ) }</h2>
			<p className="benchmarks-peer-comparison-example__insight">
				{ __( 'AI is part of daily work for some teams, with growing client demand.' ) }
			</p>
			<RangePlot
				ariaLabel={ __( 'AI work involvement compared to peers' ) }
				ranges={ [ { from: 24, to: 43, color: COLOR_RANGE } ] }
				markers={ [
					{ value: 26, color: COLOR_PEERS, ariaLabel: __( 'Agencies not in A4A: 26' ) },
					{ value: 28, color: COLOR_YOU, ariaLabel: __( 'Your submission: 28' ) },
					{ value: 32.5, color: COLOR_A4A, ariaLabel: __( 'Agencies in A4A: 32.5' ) },
				] }
				axisLabels={ [
					{ value: 0, label: __( '0 Exploring' ) },
					{ value: 25, label: __( '25 Adopting' ) },
					{ value: 50, label: __( '50 Scaling' ) },
					{ value: 75, label: __( '75 Leading' ) },
					{ value: 100, label: '100' },
				] }
			/>
			<ul className="benchmarks-peer-comparison-example__legend">
				<li>
					<span
						className="benchmarks-peer-comparison-example__legend-dot"
						style={ { background: COLOR_A4A } }
					/>
					{ __( 'agencies in A4A' ) }
					<strong>32.5 (n=10)</strong>
				</li>
				<li>
					<span
						className="benchmarks-peer-comparison-example__legend-dot"
						style={ { background: COLOR_PEERS } }
					/>
					{ __( 'agencies not in A4A' ) }
					<strong>26 (n=1)</strong>
				</li>
			</ul>
		</section>
	);
}
