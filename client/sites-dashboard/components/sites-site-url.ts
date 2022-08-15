import styled from '@emotion/styled';
import { ExternalLink } from '@wordpress/components';

export const SiteUrl = styled( ExternalLink )`
	text-overflow: ellipsis;
	display: inline-flex;
	overflow: hidden;
	font-size: 14px;
	color: var( --studio-gray-60 ) !important;
	&:hover {
		text-decoration: underline;
	}
`;

export const Truncated = styled.span`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 250px;
	margin-right: 3px;

	&:hover {
		text-decoration: underline;
	}
`;
