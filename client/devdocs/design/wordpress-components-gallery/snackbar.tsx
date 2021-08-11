import { Snackbar } from '@wordpress/components';
import React from 'react';

const SnackbarExample = () => {
	const content = 'Use Snackbars with an action link to an external page.';
	const actions = [
		{
			label: 'Open WP.org',
			url: 'https://wordpress.org',
		},
	];

	return <Snackbar actions={ actions }>{ content }</Snackbar>;
};

export default SnackbarExample;
