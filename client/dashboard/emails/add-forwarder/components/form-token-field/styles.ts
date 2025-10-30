import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Flex } from '@wordpress/components';
import { boxSizingReset } from './utils/box-sizing';
import { space } from './utils/space';

type TokensAndInputWrapperProps = {
	__next40pxDefaultSize: boolean;
	hasTokens: boolean;
};

const deprecatedPaddings = ( { __next40pxDefaultSize, hasTokens }: TokensAndInputWrapperProps ) =>
	! __next40pxDefaultSize &&
	css`
		padding-top: ${ space( hasTokens ? 1 : 0.5 ) };
		padding-bottom: ${ space( hasTokens ? 1 : 0.5 ) };
	`;

export const TokensAndInputWrapperFlex = styled( Flex )`
	padding: 7px;
	${ boxSizingReset }

	${ deprecatedPaddings }
`;
