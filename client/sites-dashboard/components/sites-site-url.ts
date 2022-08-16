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

	.components-external-link__icon {
		margin-left: 4px;
	}
`;

export const Truncated = styled.span`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	&:hover {
		text-decoration: underline;
	}
`;
