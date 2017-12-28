/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AfterTheDeadline from './after-the-deadline';
import Card from 'client/components/card';
import CompactCard from 'client/components/card/compact';
import DateTimeFormat from '../date-time-format';
import DefaultPostFormat from './default-post-format';
import PublishConfirmation from './publish-confirmation';
import {
	isJetpackMinimumVersion,
	isJetpackSite,
	siteSupportsJetpackSettingsUi,
} from 'client/state/sites/selectors';
import { getSelectedSiteId } from 'client/state/ui/selectors';

const Composing = ( {
	eventTracker,
	fields,
	handleSelect,
	handleToggle,
	hasDateTimeFormats,
	isRequestingSettings,
	isSavingSettings,
	jetpackSettingsUISupported,
	onChangeField,
	setFieldValue,
	updateFields,
} ) => {
	const CardComponent = jetpackSettingsUISupported ? CompactCard : Card;

	return (
		<div>
			<CardComponent className="composing__card site-settings">
				<PublishConfirmation />
				<DefaultPostFormat
					eventTracker={ eventTracker }
					fields={ fields }
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
					onChangeField={ onChangeField }
				/>
			</CardComponent>

			{ jetpackSettingsUISupported && (
				<AfterTheDeadline
					fields={ fields }
					handleToggle={ handleToggle }
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
					setFieldValue={ setFieldValue }
				/>
			) }
			{ hasDateTimeFormats && (
				<DateTimeFormat
					fields={ fields }
					handleSelect={ handleSelect }
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
					updateFields={ updateFields }
				/>
			) }
		</div>
	);
};

Composing.defaultProps = {
	fields: {},
	isRequestingSettings: true,
	isSavingSettings: false,
};

Composing.propTypes = {
	eventTracker: PropTypes.func.isRequired,
	fields: PropTypes.object,
	handleSelect: PropTypes.func.isRequired,
	handleToggle: PropTypes.func.isRequired,
	isRequestingSettings: PropTypes.bool,
	isSavingSettings: PropTypes.bool,
	onChangeField: PropTypes.func.isRequired,
	setFieldValue: PropTypes.func.isRequired,
	updateFields: PropTypes.func.isRequired,
};

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const siteIsJetpack = isJetpackSite( state, siteId );

	return {
		hasDateTimeFormats: ! siteIsJetpack || isJetpackMinimumVersion( state, siteId, '4.7' ),
		jetpackSettingsUISupported: siteIsJetpack && siteSupportsJetpackSettingsUi( state, siteId ),
	};
} )( Composing );
