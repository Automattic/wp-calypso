import { forwardRef, useId } from 'react';
import { CommonLogoProps } from '../types';

type BigSkyLogoProps = CommonLogoProps & Omit< React.SVGProps< SVGSVGElement >, 'width' >;

const CentralLogo = ( { fill }: Pick< BigSkyLogoProps, 'fill' > ) => {
	return (
		<>
			<path
				fill={ fill }
				d="m19.223 11.55-3.095-1.068a4.21 4.21 0 0 1-2.61-2.61L12.45 4.777c-.145-.426-.755-.426-.9 0l-1.068 3.095a4.21 4.21 0 0 1-2.61 2.61L4.777 11.55c-.426.145-.426.755 0 .9l3.095 1.068a4.21 4.21 0 0 1 2.61 2.61l1.068 3.095c.145.426.755.426.9 0l1.068-3.095a4.21 4.21 0 0 1 2.61-2.61l3.095-1.068c.426-.145.426-.755 0-.9Zm-3.613.68-1.547.533a2.105 2.105 0 0 0-1.306 1.305l-.533 1.548a.24.24 0 0 1-.453 0l-.534-1.548a2.105 2.105 0 0 0-1.305-1.305l-1.548-.534a.24.24 0 0 1 0-.453l1.548-.534a2.105 2.105 0 0 0 1.305-1.305l.534-1.547a.24.24 0 0 1 .453 0l.534 1.547c.21.615.695 1.095 1.305 1.305l1.547.534a.24.24 0 0 1 0 .453Z"
			/>
			<path
				fill={ fill }
				d="m13.247 12.079-.535.182a.734.734 0 0 0-.45.45l-.184.536c-.026.072-.13.072-.156 0l-.183-.535a.734.734 0 0 0-.45-.45l-.535-.184c-.072-.026-.072-.13 0-.156l.535-.183a.734.734 0 0 0 .45-.45l.183-.535c.026-.072.13-.072.156 0l.183.535a.734.734 0 0 0 .45.45l.536.183c.072.026.072.13 0 .156Z"
			/>
		</>
	);
};

export const Mark = forwardRef< SVGSVGElement, BigSkyLogoProps >( function Mark(
	{ height = 24, monochrome = false, title = 'Big Sky', ...props },
	ref
) {
	const titleId = useId();
	const maskId = useId();

	const brandFill = monochrome ? 'currentColor' : '#030FB0';
	const isMasked = monochrome;

	return (
		<svg
			ref={ ref }
			xmlns="http://www.w3.org/2000/svg"
			height={ height }
			viewBox="0 0 24 24"
			fill="none"
			aria-labelledby={ title ? titleId : undefined }
			{ ...props }
		>
			{ title && <title id={ titleId }>{ title }</title> }

			<circle
				cx="12"
				cy="12"
				r="12"
				fill={ brandFill }
				mask={ isMasked ? `url(#${ maskId })` : undefined }
			/>
			{ isMasked ? (
				<defs>
					<mask id={ maskId }>
						{ /* Full white rectangle to start with full visibility */ }
						<rect width="24" height="24" fill="#fff" />
						{ /* The shape we want to "cut out" is black in the mask */ }
						<CentralLogo fill="#000" />
					</mask>
				</defs>
			) : (
				<CentralLogo fill="#fff" />
			) }
		</svg>
	);
} );

export const BigSkyLogo = {
	Mark: Object.assign( Mark, {
		displayName: 'BigSkyLogo.Mark',
	} ),
};
