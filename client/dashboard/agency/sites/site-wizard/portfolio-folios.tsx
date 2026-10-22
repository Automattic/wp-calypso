import { FolioPage } from './portfolio-art-primitives';
import type { CSSProperties } from 'react';

export default function PortfolioFolios( { variant }: { variant: 'fan' | 'cascade' | 'stacks' } ) {
	return (
		<svg
			className="agency-portfolio-art"
			viewBox="0 0 480 340"
			aria-hidden="true"
			focusable="false"
		>
			{ variant === 'fan' && (
				<g transform="translate(0 -14)">
					{ [ 0, 6, 1, 5, 2, 4, 3 ].map( ( index ) => (
						<g key={ index } transform={ `rotate(${ ( index - 3 ) * 18 } 240 262)` }>
							<g
								className="agency-portfolio-art__fan-page"
								style={
									{
										'--fan-angle': `${ ( index - 3 ) * 0.8 }deg`,
										'--arrival-delay': `${ Math.abs( index - 3 ) * 40 }ms`,
									} as CSSProperties
								}
							>
								<g transform="translate(170 60) scale(1.1)">
									<FolioPage index={ index } />
								</g>
							</g>
						</g>
					) ) }
				</g>
			) }
			{ variant === 'cascade' &&
				Array.from( { length: 8 }, ( _, index ) => (
					<g key={ index } transform={ `translate(${ 99 + index * 22 } ${ 20 + index * 17 })` }>
						<g
							className="agency-portfolio-art__cascade-page"
							style={
								{
									'--cascade-x': `${ ( index - 3.5 ) * 2 }px`,
									'--arrival-delay': `${ index * 65 }ms`,
								} as CSSProperties
							}
						>
							<FolioPage index={ index } />
						</g>
					</g>
				) ) }
			{ variant === 'stacks' &&
				[ 0, 1, 2 ].map( ( stack ) => (
					<g
						key={ stack }
						transform={ `translate(${ 34 + stack * 140 } ${ stack === 1 ? 32 : 52 })` }
					>
						{ [ 0, 1, 2, 3 ].map( ( page ) => (
							<g key={ page } transform={ `translate(${ page * 5 } ${ page * 20 })` }>
								<g
									className={ page === 3 ? 'agency-portfolio-art__stack-front' : undefined }
									style={
										{
											'--arrival-delay': `${ stack * 180 }ms`,
										} as CSSProperties
									}
								>
									<g transform="scale(0.85)">
										<FolioPage index={ stack + page } />
									</g>
								</g>
							</g>
						) ) }
					</g>
				) ) }
		</svg>
	);
}
