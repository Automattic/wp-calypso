import { LoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';
const TextPlaceholder = styled( LoadingPlaceholder )( {
	height: 24,
	width: '60%',
	marginBottom: '1.25em',
} );
const FirstChoicePlaceholder = styled( LoadingPlaceholder )( {
	height: '45px',
	width: '45%',
	marginBottom: '1em',
} );
const SecondChoicePlaceholder = styled( LoadingPlaceholder )( {
	width: '45%',
	height: '45px',
	marginBottom: '1.25em',
} );

export function AdminInterfaceLoadingPlaceholder() {
	return (
		<div data-testid="loading-placeholder">
			<TextPlaceholder />
			<FirstChoicePlaceholder />
			<SecondChoicePlaceholder />
		</div>
	);
}
