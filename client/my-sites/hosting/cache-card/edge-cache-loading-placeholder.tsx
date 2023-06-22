import { LoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';

const Root = styled.div( {
	display: 'flex',
	gap: '1em',
	flexDirection: 'column',
	marginBottom: '16px',
} );

const CheckboxPlaceholderContainer = styled.div( {
	display: 'flex',
	gap: '1em',
	flexDirection: 'row',
	marginBottom: '0em',
} );

const TextLoadingPlaceholder = styled( LoadingPlaceholder )( {
	height: '1.7em',
	width: '4em',
} );

const LoadingPlaceholderStyled = styled( LoadingPlaceholder )( {
	height: '1.7em',
} );

export function EdgeCacheLoadingPlaceholder() {
	return (
		<Root>
			<TextLoadingPlaceholder />
			<CheckboxPlaceholderContainer>
				<TextLoadingPlaceholder />
				<LoadingPlaceholderStyled />
			</CheckboxPlaceholderContainer>
		</Root>
	);
}
