/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormattedHeader from 'components/formatted-header';

class JetpackOnboardingSiteTypeStep extends React.Component {
	render() {
		const { translate, siteTitle } = this.props;
		const headerText = translate( "Let's shape %s.", {
			args: siteTitle || translate( 'your new site' ),
		} );
		const subHeaderText = translate( 'What kind of site do you need? Choose an option below:' );

		return <FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />;
	}
}

export default connect( state => ( {
	// TODO: use a real selector for fetching site title
	siteTitle: get( state, [ 'jetpackOnboarding', 'siteTitle' ] ),
} ) )( localize( JetpackOnboardingSiteTypeStep ) );
