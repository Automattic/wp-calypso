import { Button as CoreButton, CompactCard } from '@automattic/components';
import styled from '@emotion/styled';

export const Root = styled( CompactCard )( {
	display: 'flex',
	alignItems: 'center',
} );

export const Details = styled.div( {
	marginRight: '1rem',
} );

export const KeyName = styled.span( {
	display: 'block',
	fontWeight: 'bold',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
} );

export const PublicKey = styled.code( {
	flex: 1,
	position: 'relative',
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

export const Button = styled( CoreButton )( {
	marginLeft: 'auto',
	flexShrink: 0,
} );

Button.defaultProps = {
	scary: true,
};
