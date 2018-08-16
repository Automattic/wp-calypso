/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { includes } from 'lodash';
import SocialLogo from 'social-logos';

/**
 * Internal dependencies
 */
import SiteImporterLogo from './site-importer/logo';

const ImporterLogo = ( { icon } ) => {
	if ( includes( [ 'wordpress', 'medium', 'blogger-alt' ], icon ) ) {
		return <SocialLogo className="importer__service-icon" icon={ icon } size={ 48 } />;
	}

	if ( includes( [ 'site-importer' ], icon ) ) {
		return <SiteImporterLogo />;
	}
	return (
		<svg
			className="importer__service-icon"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
		/>
	);
};

ImporterLogo.propTypes = {
	icon: PropTypes.string,
};

export default ImporterLogo;
