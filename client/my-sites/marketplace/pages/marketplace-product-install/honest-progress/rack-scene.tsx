import clsx from 'clsx';

const RACK_SLOTS = 4;

/**
 * The illustration: a server rack that lights up slot by slot as provisioning progresses, the
 * site sliding in during the move, and a glow while the plugin is installed. Pure — it draws
 * whatever stage and progress it is given, so it cannot run ahead of the clock that drives it.
 */
export default function RackScene( {
	stage,
	preparingProgress,
	label,
	compact = false,
}: {
	stage: number;
	preparingProgress: number;
	label: string;
	compact?: boolean;
} ) {
	// The last slot lights only once the server confirms provisioning; the others follow the
	// (capped) progress, so the rack cannot look ready before it is.
	const litSlots =
		stage >= 1
			? RACK_SLOTS
			: Math.min( RACK_SLOTS - 1, Math.floor( ( preparingProgress / 100 ) * RACK_SLOTS ) );
	const isSiteMoving = stage >= 1;
	const isFinishing = stage >= 2;

	return (
		<svg
			className={ clsx( 'marketplace-honest-scene__canvas', { 'is-compact': compact } ) }
			viewBox="0 0 480 220"
			role="img"
			aria-label={ label }
		>
			<rect
				className="marketplace-honest-scene__rack"
				x="290"
				y="30"
				width="130"
				height="160"
				rx="10"
			/>
			{ Array.from( { length: RACK_SLOTS }, ( _, index ) => {
				const y = 44 + index * 36;
				return (
					<g key={ index }>
						<rect
							className="marketplace-honest-scene__slot"
							x="302"
							y={ y }
							width="106"
							height="26"
							rx="4"
						/>
						<circle
							className={ clsx( 'marketplace-honest-scene__light', { 'is-on': index < litSlots } ) }
							cx="316"
							cy={ y + 13 }
							r="4"
						/>
						<rect
							className="marketplace-honest-scene__slot-line"
							x="330"
							y={ y + 10 }
							width="66"
							height="5"
							rx="2.5"
						/>
					</g>
				);
			} ) }
			<g className={ clsx( 'marketplace-honest-scene__site', { 'is-moving': isSiteMoving } ) }>
				<rect
					className="marketplace-honest-scene__site-card"
					x="70"
					y="70"
					width="120"
					height="86"
					rx="8"
				/>
				<rect
					className="marketplace-honest-scene__site-bar"
					x="70"
					y="70"
					width="120"
					height="20"
					rx="8"
				/>
				<circle className="marketplace-honest-scene__site-dot" cx="82" cy="80" r="3" />
				<circle className="marketplace-honest-scene__site-dot" cx="93" cy="80" r="3" />
				<rect
					className="marketplace-honest-scene__site-title"
					x="82"
					y="100"
					width="70"
					height="7"
					rx="3"
				/>
				<rect
					className="marketplace-honest-scene__site-line"
					x="82"
					y="114"
					width="94"
					height="5"
					rx="2.5"
				/>
				<rect
					className="marketplace-honest-scene__site-line"
					x="82"
					y="126"
					width="84"
					height="5"
					rx="2.5"
				/>
			</g>
			<g className={ clsx( 'marketplace-honest-scene__glow', { 'is-on': isFinishing } ) }>
				<circle cx="270" cy="46" r="4" />
				<circle cx="440" cy="70" r="3" />
				<circle cx="266" cy="180" r="3" />
				<circle cx="444" cy="160" r="4" />
				<circle cx="355" cy="14" r="4" />
			</g>
		</svg>
	);
}
