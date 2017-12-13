/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import SettingsDisplayNotice from './display-notice';
import SettingsDisplayHeader from './display-header';

class SettingsDisplay extends Component {
	static propTypes = {
		className: PropTypes.string,
		site: PropTypes.shape( {
			slug: PropTypes.string,
		} ),
		siteId: PropTypes.number,
		translate: PropTypes.func,
	};

	render = () => {
		const { className, site, siteId } = this.props;

		return (
			<Main className={ classNames( 'settings-display', className ) } wideLayout>
				<SettingsDisplayHeader site={ site } />
				<SettingsDisplayNotice siteId={ siteId } />
			</Main>
		);
	};
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const siteId = site ? site.ID : null;

	return {
		site,
		siteId,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators( {}, dispatch );
}
export default connect( mapStateToProps, mapDispatchToProps )( localize( SettingsDisplay ) );
