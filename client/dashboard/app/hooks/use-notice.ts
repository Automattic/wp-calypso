import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Hook to trigger notices.
 * It is used to simplify automated tests setups because It avoids having to import the notices store and actions directly.
 * You can just use  `jest.mock( '../use-notices' ) to mock the useNotice hook` and
 * ```
 * jest.mocked( useNotice() ).mockReturnValue( {
 *   createSuccessNotice: jest.fn(),
 *   createErrorNotice: jest.fn(),
 * } as ReturnType<typeof useNotice> );
 * ```
 */

export const useNotice = () => {
	return useDispatch( noticesStore );
};
