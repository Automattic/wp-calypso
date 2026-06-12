import { Button as CoreButton, CompactCard } from '@automattic/components';
import styled from '@emotion/styled';
import { forwardRef } from 'react';
import type { ComponentProps, ComponentRef } from 'react';

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

// `scary` defaults to true while staying overridable; wrapped in forwardRef so a ref
// passed to SSHKeyCard.Button still reaches CoreButton.
export const Button = forwardRef<
	ComponentRef< typeof StyledButton >,
	ComponentProps< typeof StyledButton >
>( ( { scary = true, ...props }, ref ) => (
	<StyledButton ref={ ref } scary={ scary } { ...props } />
) );

Button.displayName = 'Button';
