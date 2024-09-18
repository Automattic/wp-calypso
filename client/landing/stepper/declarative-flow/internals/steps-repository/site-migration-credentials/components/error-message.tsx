import React from 'react';

interface Props {
	error?: string;
}

export const ErrorMessage: React.FC< Props > = ( { error } ) => {
	if ( ! error ) {
		return null;
	}

	return <div className="site-migration-credentials__form-error">{ error }</div>;
};
