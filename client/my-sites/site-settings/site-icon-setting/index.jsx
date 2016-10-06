/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SiteIcon from 'components/site-icon';
import Button from 'components/button';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isEnabled } from 'config';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

function SiteIconSetting( { translate, siteId } ) {
	if ( ! isEnabled( 'manage/site-settings/site-icon' ) ) {
		return null;
	}

	return (
		<FormFieldset className="site-icon-setting">
			<FormLabel>{ translate( 'Site Icon' ) }</FormLabel>
			<div className="site-icon-setting__controls">
				<SiteIcon size={ 64 } siteId={ siteId } />
				<Button className="site-icon-setting__change-button">
					{ translate( 'Change site icon' ) }
				</Button>
			</div>
			<FormSettingExplanation>
				{ translate( 'The Site Icon is used as a browser and app icon for your site.' ) }
			</FormSettingExplanation>
		</FormFieldset>
	);
}

SiteIconSetting.propTypes = {
	translate: PropTypes.func,
	siteId: PropTypes.number
};

export default connect( ( state ) => ( {
	siteId: getSelectedSiteId( state )
} ) )( localize( SiteIconSetting ) );
