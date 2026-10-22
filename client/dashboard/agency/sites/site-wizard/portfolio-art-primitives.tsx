import A4ALogo from '../add-new-site/a4a-logo';

export function AgencyHub( { x = 240, y = 170 }: { x?: number; y?: number } ) {
	return (
		<g transform={ `translate(${ x } ${ y })` }>
			<rect
				className="agency-portfolio-art__paper"
				x="-34"
				y="-30"
				width="68"
				height="60"
				rx="10"
			/>
			<A4ALogo
				className="agency-portfolio-art__brand"
				x="-20"
				y="-20"
				size={ 40 }
				aria-hidden="true"
			/>
		</g>
	);
}

export function SiteNode( { index }: { index: number } ) {
	return (
		<>
			<rect className="agency-portfolio-art__paper" x="-20" y="-15" width="40" height="30" rx="3" />
			<path className="agency-portfolio-art__fine" d="M-20-7h40m-33-4h1m4 0h1" />
			<path
				className="agency-portfolio-art__accent"
				d={ `M-12 3h${ [ 21, 14, 24, 18 ][ index % 4 ] }` }
			/>
		</>
	);
}

export function FolioPage( { index }: { index: number } ) {
	return (
		<>
			<rect className="agency-portfolio-art__paper" width="128" height="184" rx="4" />
			<path d="M0 18h128" />
			<path
				className="agency-portfolio-art__fine"
				d="M9 9h1m5 0h1m5 0h1m78 0h18M12 32h25m41 0h14m8 0h16"
			/>
			<rect className="agency-portfolio-art__wash" x="12" y="44" width="104" height="62" rx="2" />
			{ index % 3 === 0 && (
				<>
					<path d="m16 94 26-32 29 30 17-18 24 27" />
					<circle className="agency-portfolio-art__accent" cx="95" cy="59" r="6" />
				</>
			) }
			{ index % 3 === 1 && (
				<>
					<circle className="agency-portfolio-art__accent" cx="64" cy="75" r="22" />
					<path d="m48 88 16-30 16 30Zm8-12h16" />
				</>
			) }
			{ index % 3 === 2 && (
				<path
					className="agency-portfolio-art__accent"
					d="M64 98V54m0 28c-16 0-23-9-23-17 14 0 23 5 23 17Zm0-13c14 0 22-8 22-16-14 0-22 5-22 16Z"
				/>
			) }
			<path d={ `M12 121h${ [ 76, 94, 62 ][ index % 3 ] }` } />
			<path className="agency-portfolio-art__fine" d="M12 132h104m-104 7h92m-92 7h77M12 167h28" />
		</>
	);
}

export function SiteRow( {
	width = 300,
	index,
	surface = true,
}: {
	width?: number;
	index: number;
	surface?: boolean;
} ) {
	return (
		<>
			{ surface && (
				<rect className="agency-portfolio-art__paper" width={ width } height="32" rx="4" />
			) }
			<rect className="agency-portfolio-art__wash" x="8" y="7" width="20" height="18" rx="2" />
			<path className="agency-portfolio-art__fine" d="M8 12h20" />
			<path d={ `M38 12h${ ( width - 95 ) * [ 0.8, 0.58, 0.95, 0.7 ][ index % 4 ] }` } />
			<path
				className="agency-portfolio-art__fine"
				d={ `M38 21h${ ( width - 110 ) * [ 0.65, 0.85, 0.5 ][ index % 3 ] }` }
			/>
			<circle className="agency-portfolio-art__accent" cx={ width - 15 } cy="16" r="2.5" />
		</>
	);
}
