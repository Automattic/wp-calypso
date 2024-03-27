import styled from '@emotion/styled';
import { ExternalLink } from '@wordpress/components';

export const SiteAdminLink = styled( ExternalLink )`
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
