/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isJetpackSite, getSiteOption } from 'state/sites/selectors';

const StatsSparkline = ( { isJetpack, siteUrl, className, siteId } ) => {
	if ( ! siteId || ! siteUrl || isJetpack ) {
		return null;
	}

	return (
		<img
			className={ className }
			src={ `${ siteUrl }/wp-includes/charts/admin-bar-hours-scale-2x.php?masterbar=1&s=${ siteId }` } />
	);
};

StatsSparkline.propTypes = {
	className: PropTypes.string,
	siteId: PropTypes.number,
	isJetpack: PropTypes.bool,
	siteUrl: PropTypes.string,
};

export default connect(
	( state, ownProps ) => {
		const { siteId } = ownProps;

		return {
			isJetpack: isJetpackSite( state, siteId ),
			siteUrl: getSiteOption( state, siteId, 'unmapped_url' )
		};
	}
)( StatsSparkline );
