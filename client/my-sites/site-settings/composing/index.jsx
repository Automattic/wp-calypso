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
import MarkdownWpcom from './markdown-wpcom';
import AfterTheDeadline from './after-the-deadline';
import { isJetpackSite, siteSupportsJetpackSettingsUi } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const Composing = ( {
	fields,
	handleToggle,
	onChangeField,
	eventTracker,
	isRequestingSettings,
	isSavingSettings,
	jetpackSettingsUISupported,
	siteIsJetpack
} ) => {
	return (
		<Card className="site-settings">
			<DefaultPostFormat
				onChangeField={ onChangeField }
				eventTracker={ eventTracker }
				isSavingSettings={ isSavingSettings }
				isRequestingSettings={ isRequestingSettings }
				fields={ fields }
			/>

			{
				fields.markdown_supported &&
				<MarkdownWpcom
					handleToggle={ handleToggle }
					isSavingSettings={ isSavingSettings }
					isRequestingSettings={ isRequestingSettings }
					fields={ fields }
				/>
			}

			{
				siteIsJetpack && jetpackSettingsUISupported && (
					<div>
						<hr />
						<AfterTheDeadline
							handleToggle={ handleToggle }
							onChangeField={ onChangeField }
							isSavingSettings={ isSavingSettings }
							isRequestingSettings={ isRequestingSettings }
							fields={ fields }
						/>
					</div>
				)
			}
		</Card>
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
