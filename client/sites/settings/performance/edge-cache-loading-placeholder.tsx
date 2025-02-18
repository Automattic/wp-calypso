import { LoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';

const Root = styled.div( {
	display: 'flex',
	gap: '1em',
	flexDirection: 'column',
	marginBottom: '16px',
} );

const TextLoadingPlaceholder = styled( LoadingPlaceholder )( {
	height: '1.7em',
	width: '7em',
} );

const LoadingPlaceholderStyled = styled( LoadingPlaceholder )( {
	height: '1.7em',
	width: '24em',
} );

export function EdgeCacheLoadingPlaceholder() {
	return (
		<Root>
			<TextLoadingPlaceholder />
			<LoadingPlaceholderStyled />
		</Root>
	);
}
