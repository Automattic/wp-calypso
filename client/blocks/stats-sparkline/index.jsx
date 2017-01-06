/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isJetpackSite, getSiteDomain } from 'state/sites/selectors';

const StatsSparkline = ( { isJetpack, siteDomain, className, siteId } ) => {
	if ( ! siteId || ! siteDomain || isJetpack ) {
		return null;
	}

	return (
		<img
			className={ className }
			src={ `https://${ siteDomain }/wp-includes/charts/admin-bar-hours-scale-2x.php?masterbar=1&s=${ siteId }` } />
	);
};

StatsSparkline.propTypes = {
	className: PropTypes.string,
	siteId: PropTypes.number,
	isJetpack: PropTypes.bool,
	siteDomain: PropTypes.string,
};

export default connect(
	( state, ownProps ) => {
		const { siteId } = ownProps;

		return {
			isJetpack: isJetpackSite( state, siteId ),
			siteDomain: getSiteDomain( state, siteId )
		};
	}
)( StatsSparkline );
