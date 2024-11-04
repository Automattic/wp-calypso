import { LoadingPlaceholder as DefaultLoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';
const FirstPlaceholder = styled( DefaultLoadingPlaceholder )( {
	height: 24,
	width: '85%',
	marginBottom: '0.25em',
} );
const SecondPlaceholder = styled( DefaultLoadingPlaceholder )( {
	height: 24,
	width: '60%',
	marginBottom: '1.5em',
} );
const ButtonPlaceholder = styled( DefaultLoadingPlaceholder )( {
	width: '148px',
	height: '40px',
} );

export function LoadingPlaceholder() {
	return (
		<div data-testid="loading-placeholder">
			<FirstPlaceholder />
			<SecondPlaceholder />
			<ButtonPlaceholder />
		</div>
	);
}
