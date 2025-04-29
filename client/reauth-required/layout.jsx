import PropTypes from 'prop-types';
import React from 'react';

// Basic layout component that just renders the primary content
function ReauthLayout( { primary } ) {
	return <div className="reauth-required-layout">{ primary }</div>;
}

ReauthLayout.propTypes = {
	primary: PropTypes.node,
};

export default ReauthLayout;
