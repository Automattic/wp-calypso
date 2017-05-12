/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import DefaultPostFormat from './default-post-format';
import AfterTheDeadline from './after-the-deadline';
import DateTimeFormat from '../date-time-format';
import { isJetpackSite, isJetpackMinimumVersion } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const Composing = ( {
	fields,
	handleToggle,
	handleSelect,
	onChangeField,
	setFieldValue,
	eventTracker,
	hasDateTimeFormats,
	isRequestingSettings,
	isSavingSettings,
	siteIsJetpack,
	updateFields,
} ) => {
	const CardComponent = siteIsJetpack ? CompactCard : Card;

	return (
		<div>
			<CardComponent className="composing__card site-settings">
				<DefaultPostFormat
					onChangeField={ onChangeField }
					eventTracker={ eventTracker }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>
			</CardComponent>

			{ siteIsJetpack &&
				<AfterTheDeadline
					handleToggle={ handleToggle }
					setFieldValue={ setFieldValue }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>
			}
			{ hasDateTimeFormats &&
				<DateTimeFormat
					fields={ fields }
					handleSelect={ handleSelect }
					isRequestingSettings={ isRequestingSettings }
					isSavingSettings={ isSavingSettings }
					updateFields={ updateFields }
				/>
			}
		</div>
	);
};

Composing.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {}
};

Composing.propTypes = {
	handleSelect: PropTypes.func.isRequired,
	handleToggle: PropTypes.func.isRequired,
	onChangeField: PropTypes.func.isRequired,
	setFieldValue: PropTypes.func.isRequired,
	eventTracker: PropTypes.func.isRequired,
	updateFields: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteIsJetpack = isJetpackSite( state, siteId );

		return {
			siteIsJetpack,
			hasDateTimeFormats: ! siteIsJetpack || isJetpackMinimumVersion( state, siteId, '4.7' ),
		};
	}
)( Composing );
