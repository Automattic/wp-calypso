import styled from '@emotion/styled';

export const SiteUrl = styled.a`
	text-overflow: ellipsis;
	overflow: hidden;
	display: inline-block;
	font-size: 14px;

	&,
	&:hover,
	&:visited {
		color: var( --studio-gray-60 );
	}
`;
