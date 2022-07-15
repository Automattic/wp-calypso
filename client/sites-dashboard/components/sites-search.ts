import Search from '@automattic/search';
import styled from '@emotion/styled';

export const SitesSearch = styled( Search )`
	--color-surface: #f6f7f7;
	border-radius: 4px;
	overflow: hidden;
	height: 44px;

	// TODO: make the fade optional in the component
	.search-component__input-fade::before {
		display: none !important;
	}
`;
