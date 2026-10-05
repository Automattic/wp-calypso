import { useEffect, useRef } from 'react';
import abstractAi from './hero/abstract-finding-ai.svg';
import abstractAmber from './hero/abstract-finding-amber.svg';
import abstractRed from './hero/abstract-finding-red.svg';
import abstractHomepage from './hero/abstract-homepage.svg';
import afterHomepage from './hero/after-homepage.svg';
import beforeHomepage from './hero/before-homepage.svg';
import findingAi from './hero/finding-ai.svg';
import findingContact from './hero/finding-contact.svg';
import findingHumanContact from './hero/finding-human-contact.svg';
import findingHuman from './hero/finding-human.svg';
import findingSeo from './hero/finding-seo.svg';
import findingTrust from './hero/finding-trust.svg';
import homepage from './hero/homepage.svg';
import findingsList from './hero/list.svg';
import modalBeforeAfter from './hero/modal-before-after.svg';
import modalFindingsA6 from './hero/modal-findings-a6.svg';
import pinsA1 from './hero/pins-a1.svg';
import pinsA2 from './hero/pins-a2.svg';
import pinsA3 from './hero/pins-a3.svg';
import pinsA4 from './hero/pins-a4.svg';
import pinsA5 from './hero/pins-a5.svg';
import pinsA6 from './hero/pins-a6.svg';
import report from './hero/report.svg';
import statusFixed from './hero/status-fixed.svg';
import statusNeedsWork from './hero/status-needs-work.svg';
import {
	GRADIENT_FRAGMENT,
	GRADIENT_PALETTES,
	GRADIENT_VERTEX,
	hexToRgb,
	type AmplifyGradientPalette,
} from './hero-gradient-shader';

/**
 * Two art directions for the Amplify hero, drawn like the A4A Products and
 * Library showcase drawings: white UI objects with real text and one shared
 * shadow. Scores come from the sample report in score-preview.tsx; finding
 * lines follow the report's criteria in sample-report-pages/page-03.jpg.
 */

export type AmplifyDrawnHero =
	| 'findings-a1'
	| 'findings-a2'
	| 'findings-a3'
	| 'findings-a4'
	| 'findings-a5'
	| 'findings-a6'
	| 'before-after'
	| 'report-tile';

export const DRAWN_HEROES: AmplifyDrawnHero[] = [
	'findings-a1',
	'findings-a2',
	'findings-a3',
	'findings-a4',
	'findings-a5',
	'findings-a6',
	'before-after',
	'report-tile',
];

export function isDrawnHero( hero: string ): hero is AmplifyDrawnHero {
	return ( DRAWN_HEROES as string[] ).includes( hero );
}

function GrainyGradient( { palette }: { palette: AmplifyGradientPalette } ) {
	const canvasRef = useRef< HTMLCanvasElement >( null );

	useEffect( () => {
		const canvas = canvasRef.current;
		const gl = canvas?.getContext( 'webgl', { antialias: false } );
		if ( ! canvas || ! gl ) {
			return;
		}
		const compile = ( type: number, source: string ) => {
			const shader = gl.createShader( type );
			if ( shader ) {
				gl.shaderSource( shader, source );
				gl.compileShader( shader );
			}
			return shader;
		};
		const vertex = compile( gl.VERTEX_SHADER, GRADIENT_VERTEX );
		const fragment = compile( gl.FRAGMENT_SHADER, GRADIENT_FRAGMENT );
		const program = gl.createProgram();
		const buffer = gl.createBuffer();
		if ( ! vertex || ! fragment || ! program || ! buffer ) {
			return;
		}
		gl.attachShader( program, vertex );
		gl.attachShader( program, fragment );
		gl.linkProgram( program );
		gl.useProgram( program );
		gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array( [ -1, -1, 1, -1, -1, 1, 1, 1 ] ),
			gl.STATIC_DRAW
		);
		const position = gl.getAttribLocation( program, 'aPosition' );
		gl.enableVertexAttribArray( position );
		gl.vertexAttribPointer( position, 2, gl.FLOAT, false, 0, 0 );
		const colors = GRADIENT_PALETTES[ palette ];

		const draw = () => {
			// Grain is drawn per device pixel, so it stays fine on retina screens.
			const bounds = canvas.getBoundingClientRect();
			const ratio = Math.min( window.devicePixelRatio || 1, 2 );
			canvas.width = Math.max( 1, Math.round( bounds.width * ratio ) );
			canvas.height = Math.max( 1, Math.round( bounds.height * ratio ) );
			gl.viewport( 0, 0, canvas.width, canvas.height );
			gl.uniform2f( gl.getUniformLocation( program, 'uSize' ), canvas.width, canvas.height );
			gl.uniform1f( gl.getUniformLocation( program, 'uSeed' ), 3 );
			[ 'uBase', 'uOne', 'uTwo', 'uThree' ].forEach( ( name, index ) =>
				gl.uniform3fv( gl.getUniformLocation( program, name ), hexToRgb( colors[ index ] ) )
			);
			gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
		};
		draw();
		const observer = new ResizeObserver( draw );
		observer.observe( canvas );
		return () => {
			observer.disconnect();
			gl.deleteBuffer( buffer );
			gl.deleteProgram( program );
			gl.deleteShader( vertex );
			gl.deleteShader( fragment );
		};
	}, [ palette ] );

	return <canvas ref={ canvasRef } className="amplify-hero__canvas" />;
}

type Placed = { src: string; x: number; y: number; width: number; height: number; flat?: boolean };

// Each object is its own SVG from Figma (MSD - Information Architecture,
// Marketplace Graphics, Amplify drawings), placed at its position in the
// 1100 x 296 tile there. The tile crops them, as the Products featured tiles do.
const PINS = { x: 0, y: 0, width: 1100, height: 296, flat: true };

const LAYOUTS: Record< AmplifyDrawnHero, Placed[] > = {
	// A1: three findings joined to the homepage by lines.
	'findings-a1': [
		{ src: homepage, x: 290, y: 40, width: 520, height: 444 },
		{ src: findingSeo, x: 40, y: 127.5, width: 210, height: 60 },
		{ src: findingContact, x: 870, y: 64, width: 210, height: 60 },
		{ src: findingTrust, x: 870, y: 181, width: 210, height: 60 },
		{ src: pinsA1, ...PINS },
	],
	// A2: close-up, one finding.
	'findings-a2': [
		{ src: homepage, x: 100, y: 60, width: 702, height: 599.4 },
		{ src: findingContact, x: 824.45, y: 94.9, width: 262.5, height: 75 },
		{ src: pinsA2, ...PINS },
	],
	// A3: numbered pins on the page, the findings in one list.
	'findings-a3': [
		{ src: homepage, x: 150, y: 40, width: 520, height: 444 },
		{ src: findingsList, x: 700, y: 48, width: 280, height: 200 },
		{ src: pinsA3, ...PINS },
	],
	// A4: one finding from each report type.
	'findings-a4': [
		{ src: homepage, x: 290, y: 40, width: 520, height: 444 },
		{ src: findingAi, x: 24, y: 19, width: 240, height: 74 },
		{ src: findingHuman, x: 836, y: 174, width: 240, height: 74 },
		{ src: pinsA4, ...PINS },
	],
	// A5: A1 with one AI finding; every card names its report type.
	'findings-a5': [
		{ src: homepage, x: 290, y: 40, width: 520, height: 444 },
		{ src: findingAi, x: 24, y: 120.5, width: 240, height: 74 },
		{ src: findingHumanContact, x: 836, y: 57, width: 240, height: 74 },
		{ src: findingHuman, x: 836, y: 174, width: 240, height: 74 },
		{ src: pinsA5, ...PINS },
	],
	// A6: A5 drawn abstract, bars instead of words, so the headline is the
	// only thing to read. Accents: the pins and one dot per finding.
	'findings-a6': [
		{ src: abstractHomepage, x: 290, y: 40, width: 520, height: 444 },
		{ src: abstractAi, x: 64, y: 129.5, width: 200, height: 56 },
		{ src: abstractRed, x: 836, y: 66, width: 200, height: 56 },
		{ src: abstractAmber, x: 836, y: 183, width: 200, height: 56 },
		{ src: pinsA6, ...PINS },
	],
	// C: the prospect's homepage today (muted, a red warning) and the agency's
	// version in front (testimonials, a clear contact button, a green check).
	'before-after': [
		{ src: beforeHomepage, x: 155, y: 70, width: 426.4, height: 364.1 },
		{ src: afterHomepage, x: 425, y: 36, width: 520, height: 444 },
		{ src: statusNeedsWork, x: 123, y: 40, width: 64, height: 64 },
		{ src: statusFixed, x: 913, y: 12, width: 64, height: 64 },
	],
	// B: the homepage report card in front of the homepage it describes.
	'report-tile': [
		{ src: homepage, x: 180, y: 40, width: 520, height: 444 },
		{ src: report, x: 600, y: 133, width: 320, height: 264 },
	],
};

/**
 * A featured tile: A4A's blues (Brand OS, brands/a4a/color.yaml) as a grainy
 * field, with the drawings on top.
 */
export default function AmplifyDrawnHeroArt( { hero }: { hero: AmplifyDrawnHero } ) {
	return (
		<div className="amplify-hero amplify-hero--tile">
			<GrainyGradient palette="brand" />
			<div className="amplify-hero__stage">
				{ LAYOUTS[ hero ].map( ( item ) => (
					<img
						key={ `${ item.src }-${ item.x }` }
						className="amplify-hero__object"
						data-flat={ item.flat ? 'true' : undefined }
						src={ item.src }
						alt=""
						width={ item.width }
						height={ item.height }
						style={ {
							// Percentages of the 1100 x 296 tile, so the layout scales as one.
							insetInlineStart: `${ ( item.x / 1100 ) * 100 }%`,
							insetBlockStart: `${ ( item.y / 296 ) * 100 }%`,
							width: `${ ( item.width / 1100 ) * 100 }%`,
						} }
					/>
				) ) }
			</div>
		</div>
	);
}

// Images drawn for the New report modal (520 x 220, the top 76px left clear
// for its header), from Figma "Modal / amplify / …".
const MODAL_ART: Partial< Record< AmplifyDrawnHero, string > > = {
	'before-after': modalBeforeAfter,
	'findings-a6': modalFindingsA6,
};

export function AmplifyModalArt( { hero }: { hero: AmplifyDrawnHero } ) {
	const image = MODAL_ART[ hero ];
	if ( ! image ) {
		return <AmplifyDrawnHeroArt hero={ hero } />;
	}
	return (
		<div className="amplify-hero amplify-hero--tile">
			<GrainyGradient palette="brand" />
			<img className="amplify-modal-art__image" src={ image } alt="" width={ 520 } height={ 220 } />
		</div>
	);
}
