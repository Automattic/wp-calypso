/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom/extend-expect';
import { renderHook } from '@testing-library/react-hooks';
import { useAnchorFmParams } from '../use-anchor-fm-params';

jest.mock( 'react-router-dom', () => ( {
	useLocation: jest.fn().mockImplementation( () => ( {
		pathname: '/setup',
		search: '?anchor_episode=e1hmk1m',
		hash: '',
		state: undefined,
	} ) ),
} ) );

describe( 'use-anchor-fm-params hook', () => {
	test( 'returns anchor episode id', async () => {
		const { result } = renderHook( () => useAnchorFmParams() );
		expect( result.current.anchorFmEpisodeId ).toEqual( 'e1hmk1m' );
	} );
} );
