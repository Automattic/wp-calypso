import styled from '@emotion/styled';

export const SiteAdminLink = styled.a`
	display: flex;
	align-items: center;
	gap: 4px;
	text-overflow: ellipsis;
	overflow: hidden;
	font-size: 14px;
	color: var( --studio-gray-60 ) !important;
	&:hover {
		text-decoration: underline;
	}
	svg {
		flex-shrink: 0;
	}
`;
