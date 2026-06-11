import { Button as CoreButton, CompactCard } from '@automattic/components';
import styled from '@emotion/styled';
import type { ComponentProps } from 'react';

export const Root = styled( CompactCard )( {
	display: 'flex',
	alignItems: 'center',
} );

export const Details = styled.div( {
	display: 'flex',
	flexDirection: 'column',
	marginInlineEnd: '1rem',
	overflow: 'hidden',
} );

export const KeyName = styled.span( {
	display: 'block',
	fontWeight: 'bold',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
} );

export const PublicKey = styled.code( {
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
} );

export const Date = styled.span( {
	display: 'block',
	fontStyle: 'italic',
	fontSize: '0.875rem',
	color: 'var( --color-text-subtle )',
} );

const StyledButton = styled( CoreButton )( {
	marginInlineStart: 'auto',
	flexShrink: 0,
} );

// `scary` defaults to true; callers can still override it via props. This used to rely on
// `defaultProps`, which React 19 ignores on function components (styled components included).
export const Button = ( props: ComponentProps< typeof StyledButton > ) => (
	<StyledButton scary { ...props } />
);
