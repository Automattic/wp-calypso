/**
 * External dependencies
 */
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { HorizontalRule } from '@wordpress/components';

export const styleProps = {
	borderColor: color( 'lightGray.500' ),
	borderRadius: '3px',
	backgroundShady: color( 'lightGray.200' ),
};

const { borderColor, borderRadius, backgroundShady } = styleProps;

export const CardUI = styled.div`
	background: ${color( 'white' )};
	box-sizing: border-box;
	border-radius: ${borderRadius};
	border: 1px solid ${borderColor};

	${handleBorderless};

	&.is-elevated {
		box-shadow: 0px 1px 3px 0px rgba( 0, 0, 0, 0.2 ), 0px 1px 1px 0px rgba( 0, 0, 0, 0.14 ),
			0px 2px 1px -1px rgba( 0, 0, 0, 0.12 );
	}
`;

export const HeaderUI = styled.div`
	border-bottom: 1px solid ${borderColor};
	border-top-left-radius: ${borderRadius};
	border-top-right-radius: ${borderRadius};
	box-sizing: border-box;

	&:last-child {
		border-bottom: none;
	}

	${headerFooterSizes};
	${handleBorderless};
	${handleShady};
`;

export const MediaUI = styled.div`
	box-sizing: border-box;
	overflow: hidden;

	& > img,
	& > iframe {
		display: block;
		height: auto;
		max-width: 100%;
		width: 100%;
	}

	&:first-of-type {
		border-top-left-radius: ${borderRadius};
		border-top-right-radius: ${borderRadius};
	}

	&:last-of-type {
		border-bottom-left-radius: ${borderRadius};
		border-bottom-right-radius: ${borderRadius};
	}
`;

export const BodyUI = styled.div`
	box-sizing: border-box;

	${bodySize};
	${handleShady};
`;

export const FooterUI = styled.div`
	border-top: 1px solid ${borderColor};
	border-bottom-left-radius: ${borderRadius};
	border-bottom-right-radius: ${borderRadius};
	box-sizing: border-box;

	&:first-of-type {
		border-top: none;
	}

	${headerFooterSizes};
	${handleBorderless};
	${handleShady};
`;

export const DividerUI = styled( HorizontalRule )`
	all: unset;
	border-top: 1px solid ${borderColor};
	box-sizing: border-box;
	display: block;
	height: 0;
	width: 100%;
`;

export function bodySize() {
	return `
		&.is-size {
			&-large {
				padding: 28px;
			}
			&-medium {
				padding: 20px;
			}
			&-small {
				padding: 12px;
			}
			&-extraSmall {
				padding: 8px;
			}
		}
	`;
}

export function headerFooterSizes() {
	return `
		&.is-size {
			&-large {
				padding: 20px 28px;
			}
			&-medium {
				padding: 12px 20px;
			}
			&-small {
				padding: 8px 12px;
			}
			&-extraSmall {
				padding: 4px 8px;
			}
		}
	`;
}

export function handleBorderless() {
	return `
		&.is-borderless {
			border: none;
		}
	`;
}

export function handleShady() {
	return `
		&.is-shady {
			background: ${ backgroundShady };
		}
	`;
}

// hack around https://github.com/WordPress/gutenberg/blob/master/packages/components/src/utils/colors.js
function color( value ) {
	switch ( value ) {
		case 'lightGray.500':
			return '#e2e4e7';
		case 'lightGray.200':
			return '#f3f4f5';
		case 'white':
			return '#fff';
	}
	return '#000';
}
