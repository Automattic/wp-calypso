export const redirectParentWindow = ( url: string ) => {
	window.top.location.href = url;
};

export const redirectToWpcomPath = ( url: string ) => {
	const origin = 'https://wordpress.com';
	const path = url.startsWith( '/' ) ? url : `/${ url }`;
	redirectParentWindow( `${ origin }${ path }` );
};
