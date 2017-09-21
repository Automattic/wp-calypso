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

const ProxyPreferences = ( { isSaving, translate } ) => (
	<div>
		<SectionHeader label={ translate( 'Proxy' ) }>
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
		<Card className="app-preferences__proxy-preferences">
			<label>
				<FormFieldset>
					<FormSelect id="select">
						<option>{ translate( 'No Proxy' ) }</option>
						<option>{ translate( 'Use System Proxy' ) }</option>
					</FormSelect>
				</FormFieldset>
			</label>
		</Card>
	</div>
);

ProxyPreferences.propTypes = {
	isSaving: PropTypes.bool,
	translate: PropTypes.func,
};

ProxyPreferences.defaultProps = {
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
)( ProxyPreferences );
