import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import type { StatCardConfig } from '../stats-grid/stat-card-config';

type Props = {
	config: StatCardConfig;
	peerLabel: string;
	youValue: number;
	peerValue: number;
};

export default function PeerCell( { config, peerLabel, youValue, peerValue }: Props ) {
	const isTie = youValue === peerValue;
	const youIsBetter =
		! isTie && ( config.higherIsBetter ? youValue > peerValue : youValue < peerValue );
	const peerIsBetter = ! isTie && ! youIsBetter;

	const peerColumnLabel = sprintf(
		/* translators: %s: anonymized peer label, e.g. "A". */
		__( 'Peer %s' ),
		peerLabel
	);

	return (
		<article className="benchmarks-peer-cell">
			<span className="benchmarks-peer-cell-label">{ config.label }</span>
			<div className="benchmarks-peer-cell-row">
				<div className="benchmarks-peer-cell-side">
					<span className="benchmarks-peer-cell-side-label">{ __( 'You' ) }</span>
					<span className={ clsx( 'benchmarks-peer-cell-value', { 'is-better': youIsBetter } ) }>
						{ config.formatter( youValue ) }
					</span>
				</div>
				<div className="benchmarks-peer-cell-side">
					<span className="benchmarks-peer-cell-side-label">{ peerColumnLabel }</span>
					<span className={ clsx( 'benchmarks-peer-cell-value', { 'is-better': peerIsBetter } ) }>
						{ config.formatter( peerValue ) }
					</span>
				</div>
			</div>
		</article>
	);
}
