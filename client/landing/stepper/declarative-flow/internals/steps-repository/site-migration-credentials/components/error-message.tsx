import React from 'react';

interface Props {
	error?: {
		message?: string;
	};
	children?: React.ReactNode;
}

export const ErrorMessage: React.FC< Props > = ( { error, children } ) => {
	if ( ! error || ! error.message ) {
		return null;
	}

	return (
		<div className="site-migration-credentials__form-error">{ children || error.message }</div>
	);
};
