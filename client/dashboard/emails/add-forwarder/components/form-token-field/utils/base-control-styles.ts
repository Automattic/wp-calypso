import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { font } from './font';
import { space } from './space';

const baseLabelTypography = css`
	font-size: 11px;
	font-weight: 499;
	line-height: 1.4;
	text-transform: uppercase;
`;

const labelStyles = css`
	${ baseLabelTypography };

	display: block;
	margin-bottom: ${ space( 2 ) };
	/**
	 * Removes Chrome/Safari/Firefox user agent stylesheet padding from
	 * StyledLabel when it is rendered as a legend.
	 */
	padding: 0;
`;

export const StyledLabel = styled.label`
	${ labelStyles }
`;

const deprecatedMarginHelp = ( { __nextHasNoMarginBottom = false } ) => {
	return (
		! __nextHasNoMarginBottom &&
		css`
			margin-bottom: revert;
		`
	);
};

export const StyledHelp = styled.p`
	margin-top: ${ space( 2 ) };
	margin-bottom: 0;
	font-size: ${ font( 'helpText.fontSize' ) };
	font-style: normal;
	color: #757575;

	${ deprecatedMarginHelp }
`;
