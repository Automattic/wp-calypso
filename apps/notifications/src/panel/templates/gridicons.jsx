import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Component } from 'react';

export default class extends Component {
	static displayName = 'Gridicons';

	static propTypes = {
		icon: PropTypes.string.isRequired,
		size: PropTypes.number,
		onClick: PropTypes.func,
	};

	render() {
		const { onClick, size = 24 } = this.props;
		const icon = `gridicons-${ this.props.icon }`;
		const sharedProps = {
			className: classNames( 'gridicon', icon ),
			height: size,
			width: size,
			onClick,
		};

		switch ( icon ) {
			default:
				return <svg height={ size } width={ size } />;

			case 'gridicons-checkmark':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path fill="none" d="M0 0h24v24H0z" />
						<path d="M9 19.414l-6.707-6.707 1.414-1.414L9 16.586 20.293 5.293l1.414 1.414" />
					</svg>
				);

			case 'gridicons-spam':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path fill="none" d="M0 0h24v24H0z" />
						<path d="M17 2H7L2 7v10l5 5h10l5-5V7l-5-5zm-4 15h-2v-2h2v2zm0-4h-2l-.5-6h3l-.5 6z" />
					</svg>
				);

			case 'gridicons-star':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path fill="none" d="M0 0h24v24H0z" />
						<path d="M12 2l2.582 6.953L22 9.257l-5.822 4.602L18.18 21 12 16.89 5.82 21l2.002-7.14L2 9.256l7.418-.304" />
					</svg>
				);

			case 'gridicons-star-outline':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Star Outline</title>
						<g>
							<path d="M12 6.308l1.176 3.167.347.936.997.042 3.374.14-2.647 2.09-.784.62.27.963.91 3.25-2.813-1.872-.83-.553-.83.552-2.814 1.87.91-3.248.27-.962-.783-.62-2.648-2.092 3.374-.14.996-.04.347-.936L12 6.308M12 2L9.418 8.953 2 9.257l5.822 4.602L5.82 21 12 16.89 18.18 21l-2.002-7.14L22 9.256l-7.418-.305L12 2z" />
						</g>
					</svg>
				);

			case 'gridicons-trash':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path fill="none" d="M0 0h24v24H0z" />
						<path d="M6.187 8h11.625l-.695 11.125C17.05 20.18 16.177 21 15.12 21H8.88c-1.057 0-1.93-.82-1.997-1.875L6.187 8zM19 5v2H5V5h3V4c0-1.105.895-2 2-2h4c1.105 0 2 .895 2 2v1h3zm-9 0h4V4h-4v1z" />
					</svg>
				);

			case 'gridicons-reader-follow':
				return (
					<svg
						{ ...sharedProps }
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
					>
						<title>Reader Follow</title>
						<g>
							<path
								clip-rule="evenodd"
								d="m4 4.5h12v6.5h1.5v-6.5-1.5h-1.5-12-1.5v1.5 10.5c0 1.1046.89543 2 2 2h7v-1.5h-7c-.27614 0-.5-.2239-.5-.5zm10.5 2h-9v1.5h9zm-5 3h-4v1.5h4zm3.5 1.5h-1v1h1zm-1-1.5h-1.5v1.5 1 1.5h1.5 1 1.5v-1.5-1-1.5h-1.5zm-2.5 2.5h-4v1.5h4zm6.5 1.25h1.5v2.25h2.25v1.5h-2.25v2.25h-1.5v-2.25h-2.25v-1.5h2.25z"
								fill="#606a73"
								fill-rule="evenodd"
							/>
						</g>
					</svg>
				);

			case 'gridicons-reader-following':
				return (
					<svg
						{ ...sharedProps }
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
					>
						<title>Reader Following</title>
						<mask
							id="mask0_372_400"
							style="mask-type:alpha"
							maskUnits="userSpaceOnUse"
							x="3"
							y="3"
							width="21"
							height="19"
						>
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M21 11.889L16.545 16.344L14.451 14.168L9.538 19H5C3.9 19 3 18.1 3 17V3H21V11.889ZM16.508 22L24 14.482L22.612 13.106L16.518 19.2L14.412 17.012L13 18.4L16.508 22ZM9 14H5V13H9V14ZM5 12H12V11H5V12ZM12 10H5V9H12V10ZM5 7H19V5H5V7Z"
								fill="white"
							/>
						</mask>
						<g mask="url(#mask0_372_400)">
							<rect x="1" y="-1" width="24" height="24" fill="#3C8832" />
						</g>
					</svg>
				);

			case 'gridicons-reader-external':
				return (
					<svg
						{ ...sharedProps }
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
					>
						<title>Reader External</title>
						<path d="m0 0h20v20h-20z" fill="#fff" />
						<path
							clip-rule="evenodd"
							d="m11.3764 2.01611h.75 5.1075.75v.75 5.10749.75h-1.5v-.75-3.2968l-5.8701 5.8701-.5303.5303-1.0607-1.06062.53032-.53033 5.87008-5.87014h-3.2968-.75zm-6.3764 3.48389h4v-1.5h-4c-1.10457 0-2 .89543-2 2v9c0 1.1046.89543 2 2 2h9c1.1046 0 2-.8954 2-2v-4h-1.5v4c0 .2761-.2239.5-.5.5h-9c-.27614 0-.5-.2239-.5-.5v-9c0-.27614.22386-.5.5-.5z"
							fill="#646970"
							fill-rule="evenodd"
						/>
					</svg>
				);

			case 'gridicons-reader-share':
				return (
					<svg
						{ ...sharedProps }
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
					>
						<title>Reader Share</title>
						<clipPath id="a">
							<path d="m0 0h20v20h-20z" />
						</clipPath>
						<g clip-path="url(#a)">
							<path
								d="m11.8666 6.79996v-3.79996l6.8 6.64993-6.8 6.64997v-3.8s-10.19997-.8844-10.19997 4.5001c0-10.77003 10.19997-10.20004 10.19997-10.20004z"
								stroke="#646970"
								stroke-linecap="round"
								stroke-width="1.5"
							/>
						</g>
					</svg>
				);

			case 'gridicons-reader-comment':
				return (
					<svg
						{ ...sharedProps }
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
					>
						<title>Reader Comment</title>
						<path
							d="m12.5278 14.5556v-.75h-.75-8.00002c-.56801 0-1.02778-.4598-1.02778-1.0278v-8.00002c0-.56801.45977-1.02778 1.02778-1.02778h12.44442c.568 0 1.0278.45977 1.0278 1.02778v7.94842c0 .9051-.4384 1.7561-1.1748 2.2822l-3.5474 2.5341z"
							fill="#fff"
							stroke="#646970"
							stroke-width="1.5"
						/>
					</svg>
				);

			case 'gridicons-reader-star':
				return (
					<svg
						fill="none"
						height="20"
						viewBox="0 0 20 20"
						width="20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<title>Reader Star</title>
						<path
							d="m10.0001 2.5 2.4463 5.33517h5.4704l-4.5834 4.23893 1.5592 5.4259-4.8925-2.8125-4.8925 2.8125 1.55917-5.4259-4.58333-4.23893h2.7352 2.73521z"
							stroke="#646970"
							stroke-linecap="round"
							stroke-width="1.5"
						/>
					</svg>
				);

			case 'gridicons-reader-star-outline':
				return (
					<svg
						fill="none"
						height="20"
						viewBox="0 0 20 20"
						width="20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<title>Reader Star Outline</title>
						<path
							d="M12.0002 3L14.9357 9.40221H21.5002L16.0002 14.489L17.8712 21L12.0002 17.625L6.12924 21L8.00024 14.489L2.50024 9.40221H5.78249H9.06474L12.0002 3Z"
							stroke="#646970"
							stroke-width="1.5"
							stroke-linecap="round"
						/>
					</svg>
				);

			case 'gridicons-mention':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Mention</title>
						<g>
							<path d="M12 2a10 10 0 0 0 0 20v-2a8 8 0 1 1 8-8v.5a1.5 1.5 0 0 1-3 0V7h-2v1a5 5 0 1 0 1 7 3.5 3.5 0 0 0 6-2.46V12A10 10 0 0 0 12 2zm0 13a3 3 0 1 1 3-3 3 3 0 0 1-3 3z" />
						</g>
					</svg>
				);

			case 'gridicons-comment':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Comment</title>
						<g>
							<path d="M3 6v9c0 1.105.895 2 2 2h9v5l5.325-3.804c1.05-.75 1.675-1.963 1.675-3.254V6c0-1.105-.895-2-2-2H5c-1.105 0-2 .895-2 2z" />
						</g>
					</svg>
				);

			case 'gridicons-add':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Add</title>
						<g>
							<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
						</g>
					</svg>
				);

			case 'gridicons-info':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Info</title>
						<g>
							<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
						</g>
					</svg>
				);

			case 'gridicons-lock':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Lock</title>
						<g>
							<path d="M18 8h-1V7c0-2.757-2.243-5-5-5S7 4.243 7 7v1H6c-1.105 0-2 .895-2 2v10c0 1.105.895 2 2 2h12c1.105 0 2-.895 2-2V10c0-1.105-.895-2-2-2zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v1H9V7zm4 8.723V18h-2v-2.277c-.595-.346-1-.984-1-1.723 0-1.105.895-2 2-2s2 .895 2 2c0 .738-.405 1.376-1 1.723z" />
						</g>
					</svg>
				);

			case 'gridicons-stats-alt':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Stats Alt</title>
						<g>
							<path d="M21 21H3v-2h18v2zM8 10H4v7h4v-7zm6-7h-4v14h4V3zm6 3h-4v11h4V6z" />
						</g>
					</svg>
				);

			case 'gridicons-reblog':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Reblog</title>
						<g>
							<path d="M22.086 9.914L20 7.828V18c0 1.105-.895 2-2 2h-7v-2h7V7.828l-2.086 2.086L14.5 8.5 19 4l4.5 4.5-1.414 1.414zM6 16.172V6h7V4H6c-1.105 0-2 .895-2 2v10.172l-2.086-2.086L.5 15.5 5 20l4.5-4.5-1.414-1.414L6 16.172z" />
						</g>
					</svg>
				);

			case 'gridicons-trophy':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Trophy</title>
						<g>
							<path d="M18 5.062V3H6v2.062H2V8c0 2.525 1.89 4.598 4.324 4.932.7 2.058 2.485 3.61 4.676 3.978V18c0 1.105-.895 2-2 2H8v2h8v-2h-1c-1.105 0-2-.895-2-2v-1.09c2.19-.368 3.976-1.92 4.676-3.978C20.11 12.598 22 10.525 22 8V5.062h-4zM4 8v-.938h2v3.766C4.836 10.416 4 9.304 4 8zm16 0c0 1.304-.836 2.416-2 2.83V7.06h2V8z" />
						</g>
					</svg>
				);

			case 'gridicons-notice':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Notice</title>
						<g>
							<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2l-.5-6h3l-.5 6z" />
						</g>
					</svg>
				);

			case 'gridicons-time':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Time</title>
						<g>
							<path d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8m0-2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.8 13.4L13 11.667V7h-2v5.333l3.2 4.266 1.6-1.2z" />
						</g>
					</svg>
				);

			case 'gridicons-reply':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Reply</title>
						<g>
							<path d="M9 16h7.2l-2.6 2.6L15 20l5-5-5-5-1.4 1.4 2.6 2.6H9c-2.2 0-4-1.8-4-4s1.8-4 4-4h2V4H9c-3.3 0-6 2.7-6 6s2.7 6 6 6z" />
						</g>
					</svg>
				);

			case 'gridicons-arrow-up':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Arrow Up</title>
						<g>
							<path d="M13 20V7.83l5.59 5.59L20 12l-8-8-8 8 1.41 1.41L11 7.83V20h2z" />
						</g>
					</svg>
				);

			case 'gridicons-arrow-down':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Arrow Down</title>
						<g>
							<path d="M11 4v12.17l-5.59-5.59L4 12l8 8 8-8-1.41-1.41L13 16.17V4h-2z" />
						</g>
					</svg>
				);

			case 'gridicons-arrow-left':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Arrow Left</title>
						<g>
							<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
						</g>
					</svg>
				);

			case 'gridicons-cross':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Cross</title>
						<g>
							<path d="M18.36 19.78L12 13.41l-6.36 6.37-1.42-1.42L10.59 12 4.22 5.64l1.42-1.42L12 10.59l6.36-6.36 1.41 1.41L13.41 12l6.36 6.36z" />
						</g>
					</svg>
				);

			case 'gridicons-cog':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Cog</title>
						<g>
							<path
								d="M20,12c0-0.568-0.061-1.122-0.174-1.656l1.834-1.612l-2-3.464l-2.322,0.786c-0.819-0.736-1.787-1.308-2.859-1.657L14,2h-4
		L9.521,4.396c-1.072,0.349-2.04,0.921-2.859,1.657L4.34,5.268l-2,3.464l1.834,1.612C4.061,10.878,4,11.432,4,12
		s0.061,1.122,0.174,1.656L2.34,15.268l2,3.464l2.322-0.786c0.819,0.736,1.787,1.308,2.859,1.657L10,22h4l0.479-2.396
		c1.072-0.349,2.039-0.921,2.859-1.657l2.322,0.786l2-3.464l-1.834-1.612C19.939,13.122,20,12.568,20,12z M12,16
		c-2.209,0-4-1.791-4-4c0-2.209,1.791-4,4-4c2.209,0,4,1.791,4,4C16,14.209,14.209,16,12,16z"
							/>
						</g>
					</svg>
				);

			case 'gridicons-cart':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<title>Cart</title>
						<g>
							<path
								d="M9 20c0 1.1-.9 2-2 2s-1.99-.9-1.99-2S5.9 18 7 18s2 .9 2 2zm8-2c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm.396-5c.937
		 0 1.75-.65 1.952-1.566L21 5H7V4c0-1.105-.895-2-2-2H3v2h2v11c0 1.105.895 2 2 2h12c0-1.105-.895-2-2-2H7v-2h10.396z"
							/>
						</g>
					</svg>
				);

			case 'gridicons-pencil':
				return (
					<svg { ...sharedProps } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<g>
							<path
								d="M13,6l5,5l-9.507,9.507c-0.686-0.686-0.689-1.794-0.012-2.485l-0.003-0.003c-0.691,0.677-1.799,0.674-2.485-0.012
		c-0.677-0.677-0.686-1.762-0.036-2.455l-0.008-0.008c-0.693,0.649-1.779,0.64-2.455-0.036L13,6z M20.586,5.586l-2.172-2.172
		c-0.781-0.781-2.047-0.781-2.828,0L14,5l5,5l1.586-1.586C21.367,7.633,21.367,6.367,20.586,5.586z M3,18v3h3
		C6,19.343,4.657,18,3,18z"
							/>
						</g>
					</svg>
				);
		}
	}
}
