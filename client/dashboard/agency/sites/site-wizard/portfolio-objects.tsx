import A4ALogo from '../add-new-site/a4a-logo';
import type { CSSProperties } from 'react';

const RING = { x: 240, y: 96, r: 40 };

const BLADES = {
	cut: 'M-5 36V150l5 10 5-6v-6h7v-8h-7v-6h9v-10h-9v-6h6v-8h-6V36Z',
	skeleton: 'M-3.5 36V150q0 4 3.5 4t3.5-4v-2h14v-8h-6v-6h6v-8h-14V36Z',
};

type Key = {
	at: number;
	tilt: number;
	bow: 'round' | 'square' | 'oval' | 'hex';
	blade: keyof typeof BLADES;
	length: number;
};

const KEYS: Key[] = [
	{ at: -64, tilt: 50, bow: 'round', blade: 'cut', length: 0.82 },
	{ at: 66, tilt: -52, bow: 'square', blade: 'cut', length: 0.86 },
	{ at: -38, tilt: 26, bow: 'oval', blade: 'skeleton', length: 1 },
	{ at: 40, tilt: -28, bow: 'round', blade: 'cut', length: 0.98 },
	{ at: -13, tilt: 9, bow: 'square', blade: 'cut', length: 1.08 },
	{ at: 15, tilt: -9, bow: 'hex', blade: 'cut', length: 1.02 },
];

function KeyBow( { shape }: { shape: Key[ 'bow' ] } ) {
	switch ( shape ) {
		case 'square':
			return (
				<rect
					className="agency-portfolio-art__paper"
					x="-16"
					y="-4"
					width="32"
					height="34"
					rx="9"
				/>
			);
		case 'oval':
			return <ellipse className="agency-portfolio-art__paper" cy="13" rx="24" ry="17" />;
		case 'hex':
			return <path className="agency-portfolio-art__paper" d="M0-5 17 4v20L0 33-17 24V4Z" />;
		default:
			return <circle className="agency-portfolio-art__paper" cy="13" r="18" />;
	}
}

function Keyring() {
	return (
		<g transform="translate(240 170) scale(1.12) translate(-240 -186)">
			<g className="agency-portfolio-art__keyring">
				{ KEYS.map( ( { at, tilt, bow, blade, length }, index ) => {
					const radians = ( at * Math.PI ) / 180;
					const x = RING.x + RING.r * Math.sin( radians );
					const y = RING.y + RING.r * Math.cos( radians );
					return (
						<g key={ index } transform={ `translate(${ x } ${ y }) rotate(${ tilt })` }>
							<g
								className="agency-portfolio-art__key"
								style={
									{
										'--swing': `${ ( index % 2 ? 1 : -1 ) * ( 6 + ( index % 3 ) * 3 ) }deg`,
										'--arrival-delay': `${ ( index % 3 ) * 60 }ms`,
									} as CSSProperties
								}
							>
								<g transform={ `scale(1 ${ length })` }>
									<path className="agency-portfolio-art__paper" d={ BLADES[ blade ] } />
									{ blade === 'cut' && (
										<path className="agency-portfolio-art__fine" d="M0 44v96" />
									) }
								</g>
								<rect
									className="agency-portfolio-art__paper"
									x="-9"
									y="29"
									width="18"
									height="8"
									rx="2"
								/>
								<KeyBow shape={ bow } />
								<circle className="agency-portfolio-art__paper" cy="2" r="5" />
							</g>
						</g>
					);
				} ) }
				<g transform={ `translate(${ RING.x } ${ RING.y + RING.r })` }>
					<g
						className="agency-portfolio-art__key"
						style={ { '--swing': '-4deg', '--arrival-delay': '90ms' } as CSSProperties }
					>
						<path d="M0 0v30" />
						<rect
							className="agency-portfolio-art__tag"
							x="-32"
							y="30"
							width="64"
							height="78"
							rx="16"
						/>
						<circle className="agency-portfolio-art__paper" cy="44" r="4.5" />
						<A4ALogo
							className="agency-portfolio-art__brand"
							x="-19"
							y="58"
							size={ 38 }
							aria-hidden="true"
						/>
					</g>
				</g>
				<circle className="agency-portfolio-art__ring" cx={ RING.x } cy={ RING.y } r={ RING.r } />
				<circle
					className="agency-portfolio-art__ink"
					cx={ RING.x }
					cy={ RING.y - RING.r + 7 }
					r="4"
				/>
			</g>
		</g>
	);
}

export default function PortfolioObjects() {
	return (
		<svg
			className="agency-portfolio-art"
			viewBox="0 0 480 340"
			aria-hidden="true"
			focusable="false"
		>
			<Keyring />
		</svg>
	);
}
