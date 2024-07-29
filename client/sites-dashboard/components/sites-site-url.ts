import styled from '@emotion/styled';
import { ExternalLink } from '@wordpress/components';

export const SiteUrl = styled( ExternalLink )`
	display: flex;
	align-items: center;
	gap: 4px;
	text-overflow: ellipsis;
	overflow: hidden;
	font-size: 14px;
	color: var( --studio-gray-60 ) !important;
	svg {
		flex-shrink: 0;
	}
`;

export const Truncated = styled.span`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;
