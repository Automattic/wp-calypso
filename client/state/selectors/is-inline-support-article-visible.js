/*
 * @returns bool ...
 */
export default () => {
	const searchParams = new URLSearchParams( window.location.search );
	return searchParams.has( 'support-article' );
};
