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
import FormCheckbox from 'components/forms/form-checkbox';

const NotificationPreferences = ( { isSaving, isSpellCheckEnabled, translate } ) => (
	<div>
		<SectionHeader label={ translate( 'Notifications' ) }>
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
				<FormCheckbox
					name="enableSpellCheck"
					checked={ isSpellCheckEnabled }
					onChange={ noop }
				/>
				<span>{ translate( 'Show Notification Badge' ) }</span>
			</label>
			<label>
				<FormCheckbox
					name="enableSpellCheck"
					checked={ isSpellCheckEnabled }
					onChange={ noop }
				/>
				<span>{ translate( 'Bounce app icon in the dock when notification is received' ) }</span>
			</label>
		</Card>
	</div>
);

NotificationPreferences.propTypes = {
	isSaving: PropTypes.bool,
	isSpellCheckEnabled: PropTypes.bool,
	translate: PropTypes.func,
};

NotificationPreferences.defaultProps = {
	isSaving: false,
	isSpellCheckEnabled: false,
	translate: identity,
};

export default flow(
	localize,
	connect(
		() => ( {
			isSaving: false,
			isSpellCheckEnabled: true,
		} )
	)
)( NotificationPreferences );
