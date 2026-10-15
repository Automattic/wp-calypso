/**
 * Builds `modifiers` for WordPress core's `POST /wp/v2/media/<id>/edit` route,
 * which edits the stored file on the server and saves the result as a new attachment.
 * See `WP_REST_Attachments_Controller::edit_media_item()`.
 */

export type ImageTransform =
	| { type: 'rotate'; direction: 'left' | 'right' }
	| { type: 'flip'; axis: 'horizontal' | 'vertical' }
	| { type: 'crop'; left: number; top: number; width: number; height: number };

export type ImageEditModifier =
	| { type: 'rotate'; args: { angle: number } }
	| { type: 'flip'; args: { flip: { horizontal: boolean; vertical: boolean } } }
	| { type: 'crop'; args: { left: number; top: number; width: number; height: number } };

/**
 * @param transform - The toolbar action. Crop values are percentages of the image size.
 * @returns The modifiers for a single edit request.
 */
export function getImageEditModifiers( transform: ImageTransform ): ImageEditModifier[] {
	switch ( transform.type ) {
		case 'rotate':
			// Core rotates clockwise by `angle` degrees.
			return [ { type: 'rotate', args: { angle: transform.direction === 'right' ? 90 : 270 } } ];
		case 'flip':
			return [
				{
					type: 'flip',
					args: {
						flip: {
							horizontal: transform.axis === 'horizontal',
							vertical: transform.axis === 'vertical',
						},
					},
				},
			];
		case 'crop': {
			const { left, top, width, height } = transform;
			return [ { type: 'crop', args: { left, top, width, height } } ];
		}
	}
}

const clampPercentage = ( value: number ) => Math.min( 100, Math.max( 0, value ) );

interface CroppedArea {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * @param area - The cropped area from the cropper, as percentages of the image size.
 * @returns A crop transform within the image bounds, or null when the area keeps the whole image.
 */
export function getCropTransform( area: CroppedArea ): ImageTransform | null {
	const left = clampPercentage( area.x );
	const top = clampPercentage( area.y );
	const width = Math.min( clampPercentage( area.width ), 100 - left );
	const height = Math.min( clampPercentage( area.height ), 100 - top );

	if ( width <= 0 || height <= 0 || ( width >= 100 && height >= 100 ) ) {
		return null;
	}

	return { type: 'crop', left, top, width, height };
}
