export type PreviewDevice = 'desktop' | 'mobile';

// The layout viewport each preview document is rendered at before it is scaled to fit.
export const DEVICE_VIEWPORTS: Record< PreviewDevice, { width: number; height: number } > = {
	desktop: { width: 1280, height: 800 },
	mobile: { width: 390, height: 844 },
};

// Matches the previous and next buttons and the sheet's toolbar in gallery.scss.
export const ARROW_SIZE = 44;
export const TOOLBAR_HEIGHT = 56;
// Narrower than this, the toolbar's two controls stop fitting side by side.
export const MIN_SHEET_WIDTH = 256;
const NARROW_STAGE = 600;
// The active slide is sized first; the neighbors get what width is left, within these bounds.
const MIN_NEIGHBOR_SCALE = 0.15;
const MAX_NEIGHBOR_SCALE = 0.6;

export type Size = { width: number; height: number };

export type SlideFit = Size & {
	/** From the device viewport to the active slide. */
	scale: number;
	/** From the active slide to its neighbors. */
	neighborScale: number;
	gap: number;
	/** The sheet around the active slide: at least as wide as the slide, with the toolbar above it. */
	sheetWidth: number;
	toolbar: number;
};

const clamp = ( value: number, min: number, max: number ) =>
	Math.min( max, Math.max( min, value ) );

/**
 * The size of the active slide: as large as the stage allows under the sheet's toolbar while
 * keeping the device's aspect ratio. When there is more than one design, both neighbors fit in
 * full beside the sheet, smaller, along with the previous and next buttons. Wide stages give the
 * buttons a lane at each side; narrow ones put them in the bottom corners, under the neighbors, so
 * the active slide keeps the width.
 */
export function fitSlide(
	stage: Size,
	device: PreviewDevice,
	browsable = true,
	toolbar = TOOLBAR_HEIGHT
): SlideFit {
	const viewport = DEVICE_VIEWPORTS[ device ];
	const aspect = viewport.width / viewport.height;
	const narrow = stage.width < NARROW_STAGE;
	const gap = narrow ? 8 : 24;
	const lane = browsable && ! narrow ? 24 + ARROW_SIZE : 0;
	const track = Math.max( 0, stage.height - toolbar );
	// What the sheet and the neighbors can take: less the lanes, a margin at each end and, between
	// the sheet and its neighbors, a gap at each side.
	const room = Math.max( 0, stage.width - 2 * lane - 2 * gap - ( browsable ? 2 * gap : 0 ) );
	const sheetFloor = toolbar > 0 ? Math.min( MIN_SHEET_WIDTH, room ) : 0;
	const width = Math.max(
		0,
		Math.min(
			track * aspect,
			browsable ? room / ( 1 + 2 * MIN_NEIGHBOR_SCALE ) : room,
			browsable && sheetFloor > 0 ? ( room - sheetFloor ) / ( 2 * MIN_NEIGHBOR_SCALE ) : Infinity
		)
	);
	const height = width / aspect;
	const sheetWidth = Math.max( width, sheetFloor );
	// Under a narrow stage's neighbors there has to be room for a button and a gap.
	const tallest = narrow && height > 0 ? ( track - 2 * ( ARROW_SIZE + gap ) ) / height : Infinity;
	return {
		width,
		height,
		scale: width / viewport.width,
		neighborScale:
			width > 0
				? Math.max(
						0,
						Math.min(
							tallest,
							clamp( ( room - sheetWidth ) / 2 / width, MIN_NEIGHBOR_SCALE, MAX_NEIGHBOR_SCALE )
						)
					)
				: MIN_NEIGHBOR_SCALE,
		gap,
		sheetWidth,
		toolbar,
	};
}

/**
 * Where a slide sits relative to the stage center, given how many places it is from the active one.
 * Every slide is centered on the active slide's line, under the toolbar. Only the active slide and
 * its immediate neighbors are on the stage.
 */
export function placeSlide( offset: number, fit: SlideFit ) {
	const distance = Math.abs( offset );
	const neighbor = fit.width * fit.neighborScale;
	const x =
		distance === 0
			? 0
			: Math.sign( offset ) *
				( fit.sheetWidth / 2 + fit.gap + neighbor / 2 + ( distance - 1 ) * ( neighbor + fit.gap ) );
	return {
		x,
		y: fit.toolbar / 2,
		scale: distance === 0 ? 1 : fit.neighborScale,
		visible: distance <= 1,
	};
}
