import styled from '@emotion/styled';

export const SiteName = styled.a< { fontSize?: number } >`
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	margin-inline-end: 8px;
	font-weight: 500;
	font-size: ${ ( props ) => `${ props.fontSize }px` };
	letter-spacing: -0.4px;

	&:is( a ):hover {
		text-decoration: underline;
	}

	&,
	&:hover,
	&:visited {
		color: var( --studio-gray-100 );
	}
`;

SiteName.defaultProps = {
	fontSize: 14,
};
