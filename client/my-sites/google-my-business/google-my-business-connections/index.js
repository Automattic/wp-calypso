/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import CompactCard from 'components/card/compact';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormLabel from 'components/forms/form-label';
import FormTelInput from 'components/forms/form-tel-input';
import FormTextInput from 'components/forms/form-text-input';

class GoogleMyBusinessConnections extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate, siteId } = this.props;

		return (
			<div className="google-my-business-connections">
				<CompactCard>
					<FormFieldset>
						<FormLegend>{ translate( 'Make connections (optional)' ) }</FormLegend>

						<p>
							{ translate(
								'Providing current info will help customers get in touch and learn more about your business'
							) }
						</p>

						<FormLabel>{ translate( 'Phone number' ) }</FormLabel>
						<FormTelInput />

						<FormLabel>{ translate( 'Website' ) }</FormLabel>
						<FormTextInput value={ siteId } />
					</FormFieldset>
				</CompactCard>
			</div>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )(
	localize( GoogleMyBusinessConnections )
);
