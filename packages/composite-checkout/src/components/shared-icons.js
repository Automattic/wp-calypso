/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

export function CheckIcon( { className, id } ) {
	return (
		<CheckIconUI
			width="20"
			height="20"
			viewBox="0 0 20 20"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			className={ className }
		>
			<mask
				id={ id + '-check-icon-mask' }
				mask-type="alpha"
				maskUnits="userSpaceOnUse"
				x="2"
				y="4"
				width="16"
				height="12"
			>
				<path d="M7.32916 13.2292L3.85416 9.75417L2.67083 10.9292L7.32916 15.5875L17.3292 5.58751L16.1542 4.41251L7.32916 13.2292Z" />
			</mask>
			<g mask={ 'url(#' + id + '-check-icon-mask)' }>
				<rect width="20" height="20" />
			</g>
		</CheckIconUI>
	);
}

CheckIcon.propTypes = {
	className: PropTypes.string,
	id: PropTypes.string,
};

const CheckIconUI = styled.svg`
	fill: #fff;
`;

export function ErrorIcon( { className } ) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			aria-hidden="true"
			className={ className }
		>
			<path
				fill="#FFFFFF"
				d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
			/>
		</svg>
	);
}

export function InfoIcon( { className } ) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			className={ className }
			aria-hidden="true"
		>
			<path fill="none" d="M0 0h24v24H0V0z" />
			<path
				fill="#FFFFFF"
				d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
			/>
		</svg>
	);
}
