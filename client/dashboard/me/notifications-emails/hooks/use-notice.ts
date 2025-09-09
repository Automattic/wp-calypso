import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

// It makes the test setup easier because it doesn't need to mock the useDispatch hook and the full store.
export const useNotice = () => {
	return useDispatch( noticesStore );
};
