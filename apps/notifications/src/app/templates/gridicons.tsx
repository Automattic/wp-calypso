import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { forwardRef } from 'react';

interface GridiconsProps {
	icon: string;
	size?: number;
	onClick?: () => void;
}

const Gridicons = forwardRef< SVGSVGElement, GridiconsProps >(
	( { icon, size = 24, onClick }, ref ) => {
		const translate = useTranslate();
		const gridiconClass = `gridicons-${ icon }`;
		const sharedProps = {
			className: clsx( 'gridicon', gridiconClass ),
			height: size,
			width: size,
			onClick,
			ref,
		};

		switch ( gridiconClass ) {
			default:
				return <svg height={ size } width={ size } />;

			case 'gridicons-checkmark':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Approve' ) }</title>
						<path fill="none" d="M0 0h24v24H0z" />
						<path d="M9 19.414l-6.707-6.707 1.414-1.414L9 16.586 20.293 5.293l1.414 1.414" />
					</svg>
				);

			case 'gridicons-spam':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Spam' ) }</title>
						<path fill="none" d="M0 0h24v24H0z" />
						<path d="M17 2H7L2 7v10l5 5h10l5-5V7l-5-5zm-4 15h-2v-2h2v2zm0-4h-2l-.5-6h3l-.5 6z" />
					</svg>
				);

			case 'gridicons-star':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Like' ) }</title>
						<path fill="none" d="M0 0h24v24H0z" />
						<path d="M12 2l2.582 6.953L22 9.257l-5.822 4.602L18.18 21 12 16.89 5.82 21l2.002-7.14L2 9.256l7.418-.304" />
					</svg>
				);

			case 'gridicons-star-outline':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Like' ) }</title>
						<g>
							<path d="M12 6.308l1.176 3.167.347.936.997.042 3.374.14-2.647 2.09-.784.62.27.963.91 3.25-2.813-1.872-.83-.553-.83.552-2.814 1.87.91-3.248.27-.962-.783-.62-2.648-2.092 3.374-.14.996-.04.347-.936L12 6.308M12 2L9.418 8.953 2 9.257l5.822 4.602L5.82 21 12 16.89 18.18 21l-2.002-7.14L22 9.256l-7.418-.305L12 2z" />
						</g>
					</svg>
				);

			case 'gridicons-trash':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Trash' ) }</title>
						<path fill="none" d="M0 0h24v24H0z" />
						<path d="M6.187 8h11.625l-.695 11.125C17.05 20.18 16.177 21 15.12 21H8.88c-1.057 0-1.93-.82-1.997-1.875L6.187 8zM19 5v2H5V5h3V4c0-1.105.895-2 2-2h4c1.105 0 2 .895 2 2v1h3zm-9 0h4V4h-4v1z" />
					</svg>
				);

			case 'gridicons-reader-follow':
				// Added "title" to the "plus" icon from the "@wordpress/icons" package. Ideally the package should support adding titles to icons.
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Reader Follow' ) }</title>
						<path d="M11 12.5V17.5H12.5V12.5H17.5V11H12.5V6H11V11H6V12.5H11Z" />
					</svg>
				);

			case 'gridicons-reader-following':
				return (
					// Added "title" to the "published" icon from the "@wordpress/icons" package. Ideally the package should support adding titles to icons.
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Reader Following' ) }</title>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M12 18.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13ZM4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm11.53-1.47-1.06-1.06L11 12.94l-1.47-1.47-1.06 1.06L11 15.06l4.53-4.53Z"
						/>
					</svg>
				);

			case 'gridicons-mention':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Mention' ) }</title>
						<g>
							<path d="M12 2a10 10 0 0 0 0 20v-2a8 8 0 1 1 8-8v.5a1.5 1.5 0 0 1-3 0V7h-2v1a5 5 0 1 0 1 7 3.5 3.5 0 0 0 6-2.46V12A10 10 0 0 0 12 2zm0 13a3 3 0 1 1 3-3 3 3 0 0 1-3 3z" />
						</g>
					</svg>
				);

			case 'gridicons-comment':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Comment' ) }</title>
						<g>
							<path d="M3 6v9c0 1.105.895 2 2 2h9v5l5.325-3.804c1.05-.75 1.675-1.963 1.675-3.254V6c0-1.105-.895-2-2-2H5c-1.105 0-2 .895-2 2z" />
						</g>
					</svg>
				);

			case 'gridicons-add':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Add' ) }</title>
						<g>
							<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
						</g>
					</svg>
				);

			case 'gridicons-info':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Info' ) }</title>
						<g>
							<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
						</g>
					</svg>
				);

			case 'gridicons-info-outline':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Info' ) }</title>
						<g>
							<path d="M13 9h-2V7h2v2zm0 2h-2v6h2v-6zm-1-7c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8m0-2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
						</g>
					</svg>
				);

			case 'gridicons-lock':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Lock' ) }</title>
						<g>
							<path d="M18 8h-1V7c0-2.757-2.243-5-5-5S7 4.243 7 7v1H6c-1.105 0-2 .895-2 2v10c0 1.105.895 2 2 2h12c1.105 0 2-.895 2-2V10c0-1.105-.895-2-2-2zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v1H9V7zm4 8.723V18h-2v-2.277c-.595-.346-1-.984-1-1.723 0-1.105.895-2 2-2s2 .895 2 2c0 .738-.405 1.376-1 1.723z" />
						</g>
					</svg>
				);

			case 'gridicons-stats-alt':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Stats' ) }</title>
						<g>
							<path d="M21 21H3v-2h18v2zM8 10H4v7h4v-7zm6-7h-4v14h4V3zm6 3h-4v11h4V6z" />
						</g>
					</svg>
				);

			case 'gridicons-reblog':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Reblog' ) }</title>
						<g>
							<path d="M22.086 9.914L20 7.828V18c0 1.105-.895 2-2 2h-7v-2h7V7.828l-2.086 2.086L14.5 8.5 19 4l4.5 4.5-1.414 1.414zM6 16.172V6h7V4H6c-1.105 0-2 .895-2 2v10.172l-2.086-2.086L.5 15.5 5 20l4.5-4.5-1.414-1.414L6 16.172z" />
						</g>
					</svg>
				);

			case 'gridicons-trophy':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Trophy' ) }</title>
						<g>
							<path d="M18 5.062V3H6v2.062H2V8c0 2.525 1.89 4.598 4.324 4.932.7 2.058 2.485 3.61 4.676 3.978V18c0 1.105-.895 2-2 2H8v2h8v-2h-1c-1.105 0-2-.895-2-2v-1.09c2.19-.368 3.976-1.92 4.676-3.978C20.11 12.598 22 10.525 22 8V5.062h-4zM4 8v-.938h2v3.766C4.836 10.416 4 9.304 4 8zm16 0c0 1.304-.836 2.416-2 2.83V7.06h2V8z" />
						</g>
					</svg>
				);

			case 'gridicons-notice':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Notice' ) }</title>
						<g>
							<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2l-.5-6h3l-.5 6z" />
						</g>
					</svg>
				);

			case 'gridicons-time':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Time' ) }</title>
						<g>
							<path d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8m0-2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.8 13.4L13 11.667V7h-2v5.333l3.2 4.266 1.6-1.2z" />
						</g>
					</svg>
				);

			case 'gridicons-reply':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Reply' ) }</title>
						<g>
							<path d="M9 16h7.2l-2.6 2.6L15 20l5-5-5-5-1.4 1.4 2.6 2.6H9c-2.2 0-4-1.8-4-4s1.8-4 4-4h2V4H9c-3.3 0-6 2.7-6 6s2.7 6 6 6z" />
						</g>
					</svg>
				);

			case 'gridicons-arrow-up':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Arrow Up' ) }</title>
						<g>
							<path d="M13 20V7.83l5.59 5.59L20 12l-8-8-8 8 1.41 1.41L11 7.83V20h2z" />
						</g>
					</svg>
				);

			case 'gridicons-arrow-down':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Arrow Down' ) }</title>
						<g>
							<path d="M11 4v12.17l-5.59-5.59L4 12l8 8 8-8-1.41-1.41L13 16.17V4h-2z" />
						</g>
					</svg>
				);

			case 'gridicons-arrow-left':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Arrow Left' ) }</title>
						<g>
							<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
						</g>
					</svg>
				);

			case 'gridicons-arrow-right':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Arrow Right' ) }</title>
						<g>
							<path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" />
						</g>
					</svg>
				);

			case 'gridicons-cross':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Dismiss' ) }</title>
						<g>
							<path d="M18.36 19.78L12 13.41l-6.36 6.37-1.42-1.42L10.59 12 4.22 5.64l1.42-1.42L12 10.59l6.36-6.36 1.41 1.41L13.41 12l6.36 6.36z" />
						</g>
					</svg>
				);

			case 'gridicons-cog':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Open notification settings' ) }</title>
						<g>
							<path d="M20,12c0-0.568-0.061-1.122-0.174-1.656l1.834-1.612l-2-3.464l-2.322,0.786c-0.819-0.736-1.787-1.308-2.859-1.657L14,2h-4L9.521,4.396c-1.072,0.349-2.04,0.921-2.859,1.657L4.34,5.268l-2,3.464l1.834,1.612C4.061,10.878,4,11.432,4,12s0.061,1.122,0.174,1.656L2.34,15.268l2,3.464l2.322-0.786c0.819,0.736,1.787,1.308,2.859,1.657L10,22h4l0.479-2.396c1.072-0.349,2.039-0.921,2.859-1.657l2.322,0.786l2-3.464l-1.834-1.612C19.939,13.122,20,12.568,20,12z M12,16c-2.209,0-4-1.791-4-4c0-2.209,1.791-4,4-4c2.209,0,4,1.791,4,4C16,14.209,14.209,16,12,16z" />
						</g>
					</svg>
				);

			case 'gridicons-cart':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Cart' ) }</title>
						<g>
							<path d="M9 20c0 1.1-.9 2-2 2s-1.99-.9-1.99-2S5.9 18 7 18s2 .9 2 2zm8-2c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm.396-5c.937 0 1.75-.65 1.952-1.566L21 5H7V4c0-1.105-.895-2-2-2H3v2h2v11c0 1.105.895 2 2 2h12c0-1.105-.895-2-2-2H7v-2h10.396z" />
						</g>
					</svg>
				);

			case 'gridicons-pencil':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Edit' ) }</title>
						<g>
							<path d="M13,6l5,5l-9.507,9.507c-0.686-0.686-0.689-1.794-0.012-2.485l-0.003-0.003c-0.691,0.677-1.799,0.674-2.485-0.012c-0.677-0.677-0.686-1.762-0.036-2.455l-0.008-0.008c-0.693,0.649-1.779,0.64-2.455-0.036L13,6z M20.586,5.586l-2.172-2.172c-0.781-0.781-2.047-0.781-2.828,0L14,5l5,5l1.586-1.586C21.367,7.633,21.367,6.367,20.586,5.586z M3,18v3h3C6,19.343,4.657,18,3,18z" />
						</g>
					</svg>
				);

			case 'gridicons-pinned':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Pinned' ) }</title>
						<path
							d="M9.23611 1.82L11.0933 0L17.583 6.35L15.7157 8.17C14.6443 7.49 13.1851 7.6 12.2361 8.53L11.4708 9.28C10.532 10.21 10.4096 11.63 11.1137 12.69L9.24632 14.51L6.78713 12.1L3.92999 14.89C3.50142 15.31 0.48101 17.6 0.0524386 17.18C-0.376133 16.76 1.9504 13.79 2.37897 13.37L5.22591 10.58L2.76672 8.16L4.63407 6.34C5.7055 7.03 7.16468 6.91 8.10346 5.98L8.86876 5.23C9.81774 4.31 9.94019 2.88 9.23611 1.82Z"
							fill="#8D8F94"
						/>
					</svg>
				);

			case 'gridicons-bell-off':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>{ translate( 'Bell Off' ) }</title>
						<g opacity="0.48">
							<mask
								id="mask0_766_4208"
								style={ { maskType: 'alpha' } }
								maskUnits="userSpaceOnUse"
								x="7"
								y="5"
								width="14"
								height="17"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M20.8003 18.0896L20.8003 17.2575L20.0591 16.7013C19.5511 16.3206 19.1357 15.6341 19.1357 15.1769L19.1357 10.5984C19.1357 7.84064 16.8995 5.60442 14.1418 5.60442C11.384 5.60442 9.14782 7.84064 9.14782 10.5984L9.14723 15.1763C9.14723 15.6335 8.7318 16.32 8.22386 16.7007L7.48199 17.2575L7.48199 18.0896L20.8003 18.0896ZM15.2826 20.5232C15.6078 20.1979 15.7705 19.7713 15.7705 19.3447L12.4376 19.3447C12.4376 19.7713 12.6009 20.1973 12.9255 20.5232C13.5767 21.1743 14.6314 21.1743 15.2826 20.5232Z"
									fill="white"
								/>
							</mask>
							<g mask="url(#mask0_766_4208)">
								<rect
									y="14.1422"
									width="20"
									height="20"
									transform="rotate(-45 0 14.1422)"
									fill="#797C82"
								/>
							</g>
							<path
								className="bell"
								d="M21.1406 6.14215L7.14062 20.1422"
								stroke="#797C82"
								strokeWidth="1.5"
							/>
							<path d="M20.1406 5.14215L5.14062 20.1421" stroke="white" strokeWidth="1.5" />
						</g>
					</svg>
				);
		}
	}
);

Gridicons.displayName = 'Gridicons';

export default Gridicons;
