/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Card from 'components/card';
import SectionHeader from 'components/section-header';

class SettingsPayments extends Component {

	static propTypes = {
		className: PropTypes.string,
	};

	render() {
		const { translate } = this.props;
		return (
			<Main
				className={ classNames( 'settingsPayments', this.props.className ) }>
				<SectionHeader label={ translate( 'Store Location and Currency' ) } />
				<Card>
					Different payment methods may be available based on your store
					location and currency.
				</Card>
			</Main>
		);
	}

}

export default localize( SettingsPayments );
