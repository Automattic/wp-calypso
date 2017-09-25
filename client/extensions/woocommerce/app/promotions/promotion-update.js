/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';

class PromotionUpdate extends React.Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number,
		} ),
		className: PropTypes.string,
	}

	render() {
		const { className } = this.props;

		return (
			<Main className={ className }>
			</Main>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );

	return {
		site,
	};
}

export default connect( mapStateToProps )( localize( PromotionUpdate ) );
