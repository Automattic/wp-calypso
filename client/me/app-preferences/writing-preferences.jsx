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

// remove eslint-disable once new css is in place for app-preferences
/* eslint-disable wpcalypso/jsx-classname-namespace */
const WritingPreferences = ( { isSaving, isSpellCheckEnabled, translate } ) => (
	<div>
		<SectionHeader label={ translate( 'Writing' ) }>
			<Button
				compact
				primary
				onClick={ noop }
				data-tip-target="settings-site-profile-save"
				type="submit"
				disabled={ false }
			>
				{ isSaving ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
			</Button>
		</SectionHeader>
		<Card className="app-writing-preferences">
			<div className="login__form-remember-me">
				<label>
					<FormCheckbox
						name="enableSpellCheck"
						checked={ isSpellCheckEnabled }
						onChange={ noop }
					/>
					<p>{ translate( 'Enable spell checking (experimental)' ) }</p>
					<p>{ translate( 'May effect performance on large posts' ) }</p>
				</label>
			</div>
		</Card>
	</div>
);

WritingPreferences.propTypes = {
	isSaving: PropTypes.bool,
	isSpellCheckEnabled: PropTypes.bool,
	translate: PropTypes.func,
};

WritingPreferences.defaultProps = {
	isSaving: false,
	isSpellCheckEnabled: false,
	translate: identity,
};

export default flow(
	localize,
	connect(
		() => ( {
			isSaving: false,
			isSpellCheckEnabled: false,
		} )
	)
)( WritingPreferences );
