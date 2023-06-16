import { LoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';

const Root = styled.div( {
	display: 'flex',
	gap: '1em',
	flexDirection: 'column',
} );

const ButtonPlaceholder = styled( LoadingPlaceholder )( {
	width: '100px',
	height: '32px',
} );

const LoadingPlaceholderStyled = styled( LoadingPlaceholder )( {
	height: '1.7em',
} );

export function ChooseUserLoadingPlaceholder() {
	return (
		<Root>
			<LoadingPlaceholderStyled />
			<LoadingPlaceholderStyled />
			<ButtonPlaceholder />
		</Root>
	);
}
