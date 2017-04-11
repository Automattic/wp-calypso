/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DefaultPostFormat from './default-post-format';
import AfterTheDeadline from './after-the-deadline';
import { isJetpackSite, siteSupportsJetpackSettingsUi } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const Composing = ( {
	fields,
	handleToggle,
	onChangeField,
	setFieldValue,
	eventTracker,
	isRequestingSettings,
	isSavingSettings,
	jetpackSettingsUISupported,
	siteIsJetpack
} ) => {
	return (
		<div>
			<Card className="composing__card site-settings">
				<DefaultPostFormat
					onChangeField={ onChangeField }
					eventTracker={ eventTracker }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>
			</Card>

			{ siteIsJetpack && jetpackSettingsUISupported &&
				<AfterTheDeadline
					handleToggle={ handleToggle }
					setFieldValue={ setFieldValue }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
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
	handleToggle: PropTypes.func.isRequired,
	onChangeField: PropTypes.func.isRequired,
	setFieldValue: PropTypes.func.isRequired,
	eventTracker: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			jetpackSettingsUISupported: siteSupportsJetpackSettingsUi( state, siteId ),
			siteIsJetpack: isJetpackSite( state, siteId ),
		};
	}
)( Composing );
