import Search from '@automattic/search';
import styled from '@emotion/styled';
import { MEDIA_QUERIES } from '../utils';

//The font should be 13px and --studio-gray-40. The icons should use --studio-black.
export const SitesSearch = styled( Search )( {
	'--color-surface': 'var( --studio-white )',

	maxHeight: '42px',
	overflow: 'hidden',
	border: '1px solid #c3c4c7',
	color: 'var( --studio-gray-40 )',
	fontSize: '13px',

	[ MEDIA_QUERIES.mediumOrLarger ]: {
		flex: '0 1 390px !important',
		alignSelf: 'stretch',
	},
} );
