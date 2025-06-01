import React from 'react';

interface Props {
	error?: {
		message?: string;
	};
}

export const ErrorMessage: React.FC< Props > = ( { error } ) => {
	if ( ! error || ! error.message ) {
		return null;
	}

	return <div className="site-migration-credentials__form-error">{ error.message }</div>;
};
