export default async ( { path } ) => {
	const response = await fetch( path );
	const data = await response.json();
	return data.body;
};

export function canAccessWpcomApis() {
	return true;
}

export function reloadProxy() {}

export function requestAllBlogsAccess() {}
