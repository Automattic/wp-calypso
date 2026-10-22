import { useId } from 'react';
import A4ALogo from '../add-new-site/a4a-logo';
import { SiteRow } from './portfolio-art-primitives';
import type { CSSProperties } from 'react';

export default function PortfolioRows( {
	variant,
}: {
	variant: 'loose-rows' | 'columns' | 'paper-roll';
} ) {
	const clipId = useId();
	return (
		<svg
			className="agency-portfolio-art"
			viewBox="0 0 480 340"
			aria-hidden="true"
			focusable="false"
		>
			{ variant === 'loose-rows' &&
				[ 68, 84, 60, 78, 64, 88, 72 ].map( ( x, index ) => (
					<g key={ index } transform={ `translate(${ x } ${ 39 + index * 38 })` }>
						<g
							className="agency-portfolio-art__loose-row"
							style={
								{
									'--row-align': `${ 76 - x }px`,
									'--arrival-delay': `${ [ 90, 0, 170, 60, 240, 130, 310 ][ index ] }ms`,
								} as CSSProperties
							}
						>
							<SiteRow width={ 328 } index={ index } />
						</g>
					</g>
				) ) }
			{ variant === 'columns' && (
				<>
					<A4ALogo
						className="agency-portfolio-art__brand"
						x="222"
						y="10"
						size={ 36 }
						aria-hidden="true"
					/>
					<path className="agency-portfolio-art__cords" d="M240 46v9m-114 9v-9h228v9" />
					{ [ 0, 1 ].map( ( column ) => (
						<g key={ column } transform={ `translate(${ 34 + column * 232 } 70)` }>
							{ Array.from( { length: 6 }, ( _, index ) => (
								<g key={ index } transform={ `translate(0 ${ index * 40 })` }>
									<SiteRow width={ 180 } index={ index + column } />
								</g>
							) ) }
						</g>
					) ) }
				</>
			) }
			{ variant === 'paper-roll' && (
				<>
					<defs>
						<clipPath id={ clipId }>
							<rect x="105" y="58" width="270" height="230" />
						</clipPath>
					</defs>
					<path
						className="agency-portfolio-art__paper"
						d="M106 38h263c11 0 17 8 17 18v231c0 12-7 20-19 20H112V58c0-12-4-20-14-20Z"
					/>
					<path
						className="agency-portfolio-art__paper"
						d="M106 38c-13 0-20 8-20 20h26c0-12 6-20 18-20Z"
					/>
					<g clipPath={ `url(#${ clipId })` }>
						<g className="agency-portfolio-art__roll-rows">
							{ Array.from( { length: 11 }, ( _, index ) => (
								<g key={ index } transform={ `translate(124 ${ 60 + index * 27 }) scale(0.9)` }>
									<SiteRow width={ 274 } index={ index } surface={ false } />
								</g>
							) ) }
						</g>
					</g>
					<path
						className="agency-portfolio-art__paper"
						d="M112 307c-15 0-25-10-25-24h266c0 14 8 24 21 24Z"
					/>
				</>
			) }
		</svg>
	);
}
