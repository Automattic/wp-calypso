// A set of utility functions designed to store and retrieve the anonymous user ID in local storage.
// These functions are particularly useful in scenarios where the anonymous user ID,
// initially stored in a cookie, might be reset. Such a reset can occur after a user,
// initially not logged in, completes a survey and subsequently logs in or signs up.
// Even if the cookie is reset, it is crucial to transmit the anonymous user ID to the server to request the linking of previously anonymous responses to the newly created account.
const ANON_ID_KEY = 'ss-anon-id';

const store = ( anonId: string ) => {
	localStorage.setItem( ANON_ID_KEY, anonId );
};

const get = () => {
	return localStorage.getItem( ANON_ID_KEY );
};

const clear = () => {
	localStorage.removeItem( ANON_ID_KEY );
};

// Initially I was going to use this function in the cart logic, but the cart logic is in onboarding package and do not want to introduce cyclic dependecies
// Perhaps there is some other package suitable for us to define those util functions which would be accessible from both the onboarding package and the calypso client
// Otherwise just clean-up
const pop = () => {
	const anonId = get();
	clear();
	return anonId;
};

export default { store, get, clear, pop };
