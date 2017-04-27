/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import qs from 'qs';

/**
 * Internal dependencies
 */
import Card from 'components/card';

class ResetPasswordEmailValidation extends Component {
	parseResetData = ( queryString ) => {
		return qs.parse( queryString );
	}

	getQueryString = () => {
		const queryString = get( window, 'location.search', null );

		if ( ! queryString ) {
			return null;
		}

		return queryString.slice( 1 );
	}

	render() {
		const { translate } = this.props;

		return (
			<Card>
				<p>{ translate( 'Validating …' ) }</p>
			</Card>
		);
	}
}

export default localize( ResetPasswordEmailValidation );
