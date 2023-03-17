import { useSelector } from 'react-redux';

// Mocking RootState because otherwise we'd have to import from the Calypso package, which is not allowed
type RootState = {
	currentUser: {
		id: string;
	};
};

export const useIsLoggedIn = () => {
	const userId = useSelector( ( state: RootState ) => state.currentUser?.id );

	return userId !== null;
};
