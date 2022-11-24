import { Path, SVG } from '@wordpress/components';
import classnames from 'classnames';
import rasterizedIcon from './wordpress.png';

// Because SVG are disallowed by default KSES policy, we use a raster, image instead for the post content.
type WordIconProps = {
	variant: 'small' | 'large' | 'raster';
	marginRight?: boolean;
};

export const WordPressIcon = ( props: WordIconProps ) => {
	const svgSize =
		props.variant === 'small'
			? {
					width: 16,
					height: 16,
			  }
			: { width: 39, height: 40 };

	return (
		<>
			<div
				className={ classnames( 'hb-support-page-embed-icon', {
					'is-small': props.variant === 'small',
					'is-large': props.variant === 'large' || props.variant === 'raster',
					'is-margin-right': props.marginRight,
				} ) }
			>
				{ props.variant === 'raster' ? (
					// req param required to avoid adding it automatically thus breaking block parsing
					<img alt="WP" src={ rasterizedIcon + '?m=1' } />
				) : (
					<SVG
						width={ svgSize.width }
						height={ svgSize.height }
						viewBox="0 0 39 40"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<Path
							d="M28.0524 35.5413L33.3575 19.6622C34.349 17.0969 34.6788 15.0459 34.6788 13.222C34.6788 12.5598 34.6367 11.9454 34.5617 11.3727C35.9177 13.9337 36.6893 16.8727 36.6893 19.9993C36.6893 26.6327 33.2166 32.4249 28.0524 35.5413V35.5413ZM21.7119 11.5674C22.7576 11.5106 23.6998 11.3967 23.6998 11.3967C24.6357 11.2823 24.5257 9.85814 23.5893 9.91496C23.5893 9.91496 20.7758 10.1435 18.9595 10.1435C17.2524 10.1435 14.3845 9.91496 14.3845 9.91496C13.4479 9.85814 13.3382 11.3394 14.2747 11.3967C14.2747 11.3967 15.1606 11.5106 16.0963 11.5674L18.8023 19.2433L15.0002 31.0445L8.67555 11.5674C9.72216 11.5106 10.6632 11.3967 10.6632 11.3967C11.5991 11.2823 11.4883 9.85814 10.5522 9.91496C10.5522 9.91496 7.73921 10.1435 5.92285 10.1435C5.59723 10.1435 5.21294 10.135 4.80438 10.1216C7.91074 5.24058 13.2493 2.01716 19.3178 2.01716C23.84 2.01716 27.9576 3.80692 31.0477 6.73814C30.9733 6.73326 30.8998 6.7235 30.823 6.7235C29.1164 6.7235 27.9058 8.26204 27.9058 9.91496C27.9058 11.3967 28.7316 12.6501 29.6121 14.1323C30.2726 15.3298 31.044 16.8681 31.044 19.0908C31.044 20.6306 30.6031 22.5672 29.7224 24.9042L27.9894 30.8967L21.7119 11.5674ZM19.3234 37.9816C17.6185 37.9816 15.9727 37.722 14.4165 37.2491L19.6288 21.5716L24.9676 36.714C25.0027 36.8023 25.0456 36.8837 25.092 36.9616C23.2865 37.6189 21.3464 37.9816 19.3234 37.9816V37.9816ZM1.94845 20.0019C1.94845 17.3948 2.48871 14.9197 3.45285 12.6838L11.7385 36.1845C5.94331 33.2704 1.94845 27.1197 1.94845 20.0019V20.0019ZM19.3198 0C8.66712 0 0 8.97146 0 19.999C0 31.0276 8.66712 40 19.3198 40C29.9727 40 38.64 31.0276 38.64 19.999C38.64 8.97146 29.9727 0 19.3198 0V0Z"
							fill="white"
						/>
					</SVG>
				) }
			</div>
		</>
	);
};
