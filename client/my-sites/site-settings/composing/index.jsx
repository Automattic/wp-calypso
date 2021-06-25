/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Latex from './latex';
import Shortcodes from './shortcodes';
import { CompactCard } from '@automattic/components';
import DateTimeFormat from '../date-time-format';
import DefaultPostFormat from './default-post-format';
import PublishConfirmation from './publish-confirmation';
import Markdown from './markdown';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';

const Composing = ( {
	eventTracker,
	fields,
	handleSelect,
	handleToggle,
	isRequestingSettings,
	isSavingSettings,
	onChangeField,
	setFieldValue,
	siteIsJetpack,
	updateFields,
} ) => (
	<>
		<CompactCard className="composing__card site-settings">
			<PublishConfirmation />
			<DefaultPostFormat
				eventTracker={ eventTracker }
				fields={ fields }
				isRequestingSettings={ isRequestingSettings }
				isSavingSettings={ isSavingSettings }
				onChangeField={ onChangeField }
			/>
		</CompactCard>

		<Markdown
			fields={ fields }
			isRequestingSettings={ isRequestingSettings }
			isSavingSettings={ isSavingSettings }
			handleToggle={ handleToggle }
		/>

		{ siteIsJetpack && (
			<>
				<Latex
					fields={ fields }
					handleToggle={ handleToggle }
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
					setFieldValue={ setFieldValue }
				/>
				<Shortcodes
					fields={ fields }
					handleToggle={ handleToggle }
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
					setFieldValue={ setFieldValue }
				/>
			</>
		) }

		<DateTimeFormat
			fields={ fields }
			handleSelect={ handleSelect }
			isRequestingSettings={ isRequestingSettings }
			isSavingSettings={ isSavingSettings }
			updateFields={ updateFields }
		/>
	</>
);

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

export default connect( ( state ) => ( {
	siteIsJetpack: isJetpackSite( state, getSelectedSiteId( state ) ),
} ) )( Composing );
