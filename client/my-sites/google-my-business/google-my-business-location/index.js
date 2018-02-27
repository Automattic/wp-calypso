/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import Button from 'components/button';

const GoogleMyBusinessLocation = ( { translate, title, text, href, verified } ) => (
	<div>
		<h2 className="google-my-business-location__header">{ title }</h2>
		<div className="google-my-business-location__text">
			{ text }
			{ verified ? ( <div className="google-my-business-location__verified"><Gridicon icon="checkmark-circle" className="google-my-business-location__verified-gridicon" size="18" /> Verified</div> ) : null }
		</div>
		<Button href={ href }>{ translate( 'Connect location' ) }</Button>
	</div>
);

GoogleMyBusinessLocation.propTypes = {
	recordTracksEvent: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
	title: PropTypes.string,
	text: PropTypes.object,
	href: PropTypes.string,
	verified: PropTypes.bool,
};

export default connect( undefined, { recordTracksEvent } )( localize( GoogleMyBusinessLocation ) );
