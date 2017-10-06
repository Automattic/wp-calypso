/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';

class PromotionCreate extends React.Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number,
		} ),
		className: PropTypes.string,
	};

	render() {
		const { className } = this.props;

		return <Main className={ className } />;
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );

	return {
		site,
	};
}

export default connect( mapStateToProps )( localize( PromotionCreate ) );
