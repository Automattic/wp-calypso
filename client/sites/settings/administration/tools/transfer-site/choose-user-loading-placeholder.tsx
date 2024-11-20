import { LoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';

const ButtonPlaceholder = styled( LoadingPlaceholder )( {
	width: '100px',
	height: '32px',
	marginTop: '1em',
	marginBottom: '1.5em',
} );

const LoadingPlaceholderStyledOne = styled( LoadingPlaceholder )( {
	height: '1.7em',
	marginBottom: '.5em',
} );

const LoadingPlaceholderStyledTwo = styled( LoadingPlaceholderStyledOne )( {
	width: '50%',
} );

export function ChooseUserLoadingPlaceholder() {
	return (
		<div>
			<LoadingPlaceholderStyledOne />
			<LoadingPlaceholderStyledTwo />
			<ButtonPlaceholder />
		</div>
	);
}
