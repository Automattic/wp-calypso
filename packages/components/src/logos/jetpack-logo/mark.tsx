import colorStudio from '@automattic/color-studio';
import { forwardRef, useId } from 'react';
import { CommonLogoProps } from '../types';

const PALETTE = colorStudio.colors;
const COLOR_JETPACK = PALETTE[ 'Jetpack Green 40' ];

type JetpackLogoProps = CommonLogoProps & Omit< React.SVGProps< SVGSVGElement >, 'width' >;

const NORMALIZED_FRAME_HEIGHT = 80;

export const Mark = forwardRef< SVGSVGElement, JetpackLogoProps >( function Mark(
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
			viewBox="0 0 80 80"
			fill="none"
			aria-labelledby={ title ? titleId : undefined }
			{ ...props }
		>
			{ title && <title id={ titleId }>{ title }</title> }

			{ /* Make the triangles white when in brand-color more, but transparent when in monochrome */ }
			{ ! monochrome && (
				<circle
					cx={ NORMALIZED_FRAME_HEIGHT / 2 }
					cy={ NORMALIZED_FRAME_HEIGHT / 2 }
					r={ NORMALIZED_FRAME_HEIGHT / 2 - 1 }
					fill="#fff"
				/>
			) }
			<path
				fill={ brandFill }
				d="M40.55 0a40 40 0 1 1 0 80 40 40 0 0 1 0-80Zm2.03 72.08L62.53 33.3H42.58v38.77ZM18.57 46.7h19.95V7.93L18.57 46.7Z"
			/>
		</svg>
	);
} );
