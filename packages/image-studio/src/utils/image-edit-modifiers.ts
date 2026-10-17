/**
 * Builds `modifiers` for WordPress core's `POST /wp/v2/media/<id>/edit` route,
 * which edits the stored file on the server and saves the result as a new attachment.
 * See `WP_REST_Attachments_Controller::edit_media_item()`.
 */

export type ImageTransform =
	| { type: 'rotate'; direction: 'left' | 'right' }
	| { type: 'flip'; axis: 'horizontal' | 'vertical' };

export type ImageEditModifier =
	| { type: 'rotate'; args: { angle: number } }
	| { type: 'flip'; args: { flip: { horizontal: boolean; vertical: boolean } } };

/**
 * @param transform - The toolbar action.
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
	}
}
