export const isClientView = (): boolean => {
	return window.location.pathname.startsWith( '/client/' );
};
