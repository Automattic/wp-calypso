import React from 'react';

import Layout from 'layout';

export default function App( props ) {
	const { route } = props;
	const segment = route ? route.name : undefined;
	const primary = null;
	return (
		<Layout { ...props } primary={ primary } />
	);
}
