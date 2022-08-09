import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';

export const ExternalLinkIcon = styled( Gridicon )`
	display: none;
	margin-left: 3px;
	margin-right: 0px;
	position: relative;
	top: 2px;
`;

export const SiteUrl = styled.a( {
	textOverflow: 'ellipsis',
	overflow: 'hidden',
	display: 'inline-block',
	fontSize: '14px',
	color: 'var( --studio-gray-60 ) !important',

	[ `:hover ${ ExternalLinkIcon }` ]: {
		display: 'inline-block',
	},
	'&:hover,&:visited': {
		fontWeight: 500,
	},
} );
