import colorStudio from '@automattic/color-studio';
import { forwardRef, useId } from 'react';
import { CommonLogoProps } from '../types';

const PALETTE = colorStudio.colors;
const COLOR_JETPACK = PALETTE[ 'Jetpack Green 40' ];

type JetpackLogoProps = CommonLogoProps & Omit< React.SVGProps< SVGSVGElement >, 'width' >;

const NORMALIZED_FRAME_HEIGHT = 80;
const DEFAULT_LOGO_HEIGHT = 58;

export const Default = forwardRef< SVGSVGElement, JetpackLogoProps >( function Default(
	{ height = 32, monochrome = false, title = 'Jetpack', ...props },
	ref
) {
	const titleId = useId();

	const brandFill = monochrome ? 'currentColor' : COLOR_JETPACK;

	return (
		<svg
			ref={ ref }
			xmlns="http://www.w3.org/2000/svg"
			height={ height }
			viewBox={ `0 0 215 ${ NORMALIZED_FRAME_HEIGHT }` }
			fill="none"
			aria-labelledby={ title ? titleId : undefined }
			{ ...props }
		>
			{ title && <title id={ titleId }>{ title }</title> }

			<g transform={ `translate(0, ${ ( NORMALIZED_FRAME_HEIGHT - DEFAULT_LOGO_HEIGHT ) / 2 })` }>
				{ /* TODO: as a small optimization, we could re-use the mark path in the default variant */ }
				{ /* Make the triangles white when in brand-color more, but transparent when in monochrome */ }
				{ ! monochrome && (
					<circle
						cx={ DEFAULT_LOGO_HEIGHT / 2 }
						cy={ DEFAULT_LOGO_HEIGHT / 2 }
						r={ DEFAULT_LOGO_HEIGHT / 2 - 1 }
						fill="#fff"
					/>
				) }
				<path
					fill={ brandFill }
					d="M29.6 0a29.03 29.03 0 0 1 29.05 29c0 16.02-13 29-29.05 29A29.03 29.03 0 0 1 .55 29c0-16.02 13-29 29.05-29Zm1.47 52.25 14.5-28.1h-14.5v28.1Zm-17.43-18.4h14.49V5.75l-14.5 28.1Z"
				/>

				{ /* "Jetpack" Text */ }
				<path
					d="M75.56 48.17c-.82-1.25-1.6-2.55-2.38-3.76 4.12-2.47 5.46-4.5 5.46-8.27V14.41h-4.8v-4.15H84.1v24.8c0 6.32-1.78 9.82-8.55 13.11Zm43.02-14.84c0 2.09 1.52 2.33 2.52 2.33s2.45-.34 3.53-.64v3.9c-1.73.58-3.56.88-5.4.86-2.68 0-5.75-1-5.75-5.63V22.73h-2.84v-3.95h2.82v-5.84h5.13v5.8h6.43v3.99h-6.44v10.6Zm10.66 16.79v-31.4h4.9v1.88a10.67 10.67 0 0 1 6.77-2.42c4.6 0 8.23 3.2 8.23 10.13 0 6.88-3.98 11.43-10.58 11.43a20.9 20.9 0 0 1-4.2-.48v10.86h-5.12Zm10.28-27.74c-1.52 0-3.38.69-5.16 2.25v10.69c1.26.26 2.54.39 3.82.39 3.6 0 5.68-2.3 5.68-7.01 0-4.42-1.48-6.32-4.34-6.32Zm29.7 16.88h-4.77v-2.25h-.13c-1.7 1.3-3.73 2.64-6.76 2.64-2.7 0-5.56-1.95-5.56-5.85 0-5.25 4.51-6.23 7.64-6.67l4.46-.6v-.6c0-2.77-1.12-3.68-3.73-3.68-2.3.1-4.56.56-6.71 1.38l-.44-4.1a25.32 25.32 0 0 1 7.8-1.35c5 0 8.2 1.99 8.2 7.92v13.16Zm-5.12-9.57-4.2.64c-1.26.18-2.6.94-2.6 2.84 0 1.68.95 2.61 2.34 2.61 1.47 0 3.12-.9 4.46-1.86V29.7Zm26.17 8.91a19 19 0 0 1-6.4 1.18c-7.67 0-10.7-4.37-10.7-10.74 0-6.7 4.2-10.86 11-10.86 2.57 0 4.1.43 5.84 1v4.33a17.13 17.13 0 0 0-5.75-1.16c-3.12 0-5.75 1.64-5.75 6.44 0 5.28 2.64 6.84 6.02 6.84 1.6 0 3.4-.34 5.74-1.25v4.23Zm9.67-11.03c.43-.47.78-1 7.2-8.83h6.63l-8.33 9.74 9.11 10.78h-6.68l-7.93-9.74v9.74h-5.12v-29h5.12v17.31ZM106.8 38.6a24.61 24.61 0 0 1-7.58 1.18c-6.54 0-10.57-3.25-10.57-10.91 0-5.58 3.42-10.7 10.01-10.7 6.55 0 8.85 4.55 8.85 8.9 0 1-.05 2.01-.18 3.02H94.15c.13 4.5 2.68 5.54 6.5 5.54 2.1 0 4.02-.47 6.16-1.26v4.24Zm-4.63-11.9c0-2.5-.83-4.67-3.56-4.67-2.56 0-4.12 1.83-4.42 4.68h7.98Z"
					fill="currentColor"
				/>
			</g>
		</svg>
	);
} );
