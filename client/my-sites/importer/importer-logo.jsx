/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import WixLogo from './logos/wix';
import MediumLogo from './logos/medium';
import SubstackLogo from './logos/substack';
import SocialLogo from 'calypso/components/social-logo';

/**
 * Style dependencies
 */
import './importer-logo.scss';

const ImporterLogo = ( { icon } ) => {
	if ( includes( [ 'wordpress', 'blogger-alt', 'squarespace' ], icon ) ) {
		return <SocialLogo className="importer__service-icon" icon={ icon } size={ 48 } />;
	}

	if ( 'wix' === icon ) {
		return <WixLogo />;
	}

	if ( 'medium' === icon ) {
		return <MediumLogo />;
	}

	if ( 'substack' === icon ) {
		return <SubstackLogo />;
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
