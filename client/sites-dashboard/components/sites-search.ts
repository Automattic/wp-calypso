import Search from '@automattic/search';
import styled from '@emotion/styled';

export const SitesSearch = styled( Search )`
	--color-surface: var( --studio-white );
	height: 42px;
	overflow: hidden;
	border: 1px solid #c3c4c7;

	width: 390px !important; // <Search /> CSS specificity is getting in the way, so we need to prioritize our changes.
	max-width: 100%;
`;
