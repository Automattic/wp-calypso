import Search from '@automattic/search';
import styled from '@emotion/styled';
import { MEDIA_QUERIES } from '../utils';

export const SitesSearch = styled( Search )( {
	'--color-surface': 'var( --studio-white )',

	height: '42px !important',

	overflow: 'hidden',
	border: '1px solid #c3c4c7',

	[ MEDIA_QUERIES.mediumOrLarger ]: {
		flex: '0 1 390px !important',

		height: 'auto !important',
		alignSelf: 'stretch',
	},
} );
