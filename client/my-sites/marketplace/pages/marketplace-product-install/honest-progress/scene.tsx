import './style.scss';

import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useHonestFooterCopy, useHonestStageCopy } from './copy';
import { useHonestProgress } from './use-honest-progress';

const RACK_SLOTS = 4;

/**
 * The graphic honest wait: the same three real stages as the narrated list, told as a scene.
 * A server rack lights up slot by slot as provisioning progresses, the site slides in during
 * the move, and the rack glows while the plugin is installed. Every beat is driven by the
 * same status-backed clock as the list, so the scene cannot finish before the transfer does.
 */
export default function HonestInstallScene( {
	transferStatus,
	currentStep,
}: {
	transferStatus: string | null;
	currentStep: number;
} ) {
	const translate = useTranslate();
	const { stage, elapsed, isOverrun, getStageProgress } = useHonestProgress( {
		transferStatus,
		currentStep,
	} );
	const stages = useHonestStageCopy();
	const footer = useHonestFooterCopy();

	const litSlots = Math.min(
		RACK_SLOTS,
		Math.floor( ( getStageProgress( 0 ) / 100 ) * ( RACK_SLOTS + 0.5 ) )
	);
	const isSiteMoving = stage >= 1;
	const isFinishing = stage >= 2;

	return (
		<div className="marketplace-honest-progress marketplace-honest-scene">
			<h1 className="marketplace-honest-progress__heading">
				{ translate( 'Setting up your plugin' ) }
			</h1>
			<svg
				className="marketplace-honest-scene__canvas"
				viewBox="0 0 480 220"
				role="img"
				aria-label={ String( stages[ stage ].title ) }
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
								className={ clsx( 'marketplace-honest-scene__light', {
									'is-on': index < litSlots,
								} ) }
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
				<g
					className={ clsx( 'marketplace-honest-scene__site', {
						'is-moving': isSiteMoving,
					} ) }
				>
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
			<p className="marketplace-honest-scene__caption" role="status">
				{ stages[ stage ].title }
			</p>
			<p className="marketplace-honest-scene__caption-detail">{ stages[ stage ].description }</p>
			<ol className="marketplace-honest-scene__dots" aria-hidden="true">
				{ stages.map( ( _, index ) => (
					<li
						key={ index }
						className={ clsx( 'marketplace-honest-scene__dot', {
							'is-done': index < stage,
							'is-active': index === stage,
						} ) }
					/>
				) ) }
			</ol>
			<p className="marketplace-honest-progress__meta">{ footer.elapsed( elapsed ) }</p>
			{ isOverrun && (
				<p className="marketplace-honest-progress__overrun" role="status">
					{ footer.overrun }
				</p>
			) }
			<p className="marketplace-honest-progress__education">{ footer.education }</p>
		</div>
	);
}
