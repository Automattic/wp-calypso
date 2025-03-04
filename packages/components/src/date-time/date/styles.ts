/**
 * External dependencies
 */
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import Button from '../../button';
import { boxSizingReset, COLORS, CONFIG } from '../../utils';
import { HStack } from '../../h-stack';
import { Heading } from '../../heading';
import { space } from '../../utils/space';

export const Wrapper = styled.div`
	${ boxSizingReset }
`;

export const Navigator = styled( HStack )`
	margin-bottom: ${ space( 4 ) };
`;

export const NavigatorHeading = styled( Heading )`
	font-size: ${ CONFIG.fontSize };
	font-weight: ${ CONFIG.fontWeight };

	strong {
		font-weight: ${ CONFIG.fontWeightHeading };
	}
`;

export const Calendar = styled.div`
	column-gap: ${ space( 2 ) };
	display: grid;
	grid-template-columns: 0.5fr repeat( 5, 1fr ) 0.5fr;
	justify-items: center;
	row-gap: ${ space( 2 ) };
`;

export const DayOfWeek = styled.div`
	color: ${ COLORS.theme.gray[ 700 ] };
	font-size: ${ CONFIG.fontSize };
	line-height: ${ CONFIG.fontLineHeightBase };

	&:nth-of-type( 1 ) {
		justify-self: start;
	}

	&:nth-of-type( 7 ) {
		justify-self: end;
	}
`;

export const DayButton = styled( Button, {
	shouldForwardProp: ( prop: string ) =>
		! [ 'column', 'isSelected', 'isToday', 'hasEvents' ].includes( prop ),
} )< {
	column: number;
	isSelected: boolean;
	isToday: boolean;
	hasEvents: boolean;
} >`
	grid-column: ${ ( props ) => props.column };
	position: relative;
	justify-content: center;

	${ ( props ) =>
		props.column === 1 &&
		`
		justify-self: start;
		` }

	${ ( props ) =>
		props.column === 7 &&
		`
		justify-self: end;
		` }

	${ ( props ) =>
		props.disabled &&
		`
		pointer-events: none;
		` }

	&&& {
		border-radius: ${ CONFIG.radiusRound };
		height: ${ space( 7 ) };
		width: ${ space( 7 ) };

		${ ( props ) =>
			props.isSelected &&
			`
				background: ${ COLORS.theme.accent };

				&,
				&:hover:not(:disabled, [aria-disabled=true]) {
					color: ${ COLORS.theme.accentInverted };
				}

				&:focus:not(:disabled),
				&:focus:not(:disabled) {
					border: ${ CONFIG.borderWidthFocus } solid currentColor;
				}

				/* Highlight the selected day for high-contrast mode */
				&::after {
					content: '';
					position: absolute;
					pointer-events: none;
					inset: 0;
					border-radius: inherit;
					border: 1px solid transparent;
				}
			` }

		${ ( props ) =>
			! props.isSelected &&
			props.isToday &&
			`
			background: ${ COLORS.theme.gray[ 200 ] };
			` }
	}

	${ ( props ) =>
		props.hasEvents &&
		`
		::before {
			border: 2px solid ${
				props.isSelected
					? COLORS.theme.accentInverted
					: COLORS.theme.accent
			};
			border-radius: ${ CONFIG.radiusRound };
			content: " ";
			left: 50%;
			position: absolute;
			transform: translate(-50%, 9px);
		}
		` }
`;
