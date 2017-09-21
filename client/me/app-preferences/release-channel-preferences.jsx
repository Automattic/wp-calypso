/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { flow, identity, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import SectionHeader from 'components/section-header';
import FormSelect from 'components/forms/form-select';
import FormFieldset from 'components/forms/form-fieldset';

const ReleaseChannelPreferences = ( { isSaving, translate } ) => (
	<div>
		<SectionHeader label={ translate( 'Release Channel' ) }>
			<Button
				compact
				primary
				onClick={ noop }
				type="submit"
				disabled={ false }
			>
				{ isSaving ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
			</Button>
		</SectionHeader>
		<Card className="app-preferences__writing-preferences">
			<label>
				<FormFieldset>
					<FormSelect id="select">
						<option>{ translate( 'Stable' ) }</option>
						<option>{ translate( 'Beta' ) }</option>
					</FormSelect>
				</FormFieldset>
				<p>{ translate( 'Select Stable channel for official, public releases of the app.' ) }</p>
				<p>{ translate( 'Select Beta channel if you want to get and help test preview releases of the app.' ) }</p>
			</label>
		</Card>
	</div>
);

ReleaseChannelPreferences.propTypes = {
	isSaving: PropTypes.bool,
	translate: PropTypes.func,
};

ReleaseChannelPreferences.defaultProps = {
	isSaving: false,
	translate: identity,
};

export default flow(
	localize,
	connect(
		() => ( {
			isSaving: false,
		} )
	)
)( ReleaseChannelPreferences );
