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
import { isJetpackSite, getCustomizerUrl, getSiteAdminUrl } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isEnabled } from 'config';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import InfoPopover from 'components/info-popover';
import { addQueryArgs } from 'lib/url';

function SiteIconSetting( { translate, siteId, isJetpack, customizerUrl, generalOptionsUrl } ) {
	let buttonProps;
	if ( isEnabled( 'manage/site-settings/site-icon' ) ) {
		buttonProps = {
			type: 'button'
		};
	} else {
		buttonProps = { rel: 'external' };

		if ( isJetpack ) {
			buttonProps.href = addQueryArgs( {
				'autofocus[section]': 'title_tagline'
			}, customizerUrl );
		} else {
			buttonProps.href = generalOptionsUrl;
			buttonProps.target = '_blank';
		}
	}

	return (
		<FormFieldset className="site-icon-setting">
			<FormLabel className="site-icon-setting__heading">
				{ translate( 'Site Icon' ) }
				<InfoPopover position="bottom right">
					{ translate( 'A browser and app icon for your site.' ) }
				</InfoPopover>
			</FormLabel>
			{ React.createElement( buttonProps.href ? 'a' : 'button', {
				...buttonProps,
				className: 'site-icon-setting__icon'
			}, <SiteIcon size={ 96 } siteId={ siteId } /> ) }
			<Button
				{ ...buttonProps }
				className="site-icon-setting__change-button"
				compact>
				{ translate( 'Change' ) }
			</Button>
		</FormFieldset>
	);
}

SiteIconSetting.propTypes = {
	translate: PropTypes.func,
	siteId: PropTypes.number,
	isJetpack: PropTypes.bool,
	customizerUrl: PropTypes.string,
	generalOptionsUrl: PropTypes.string
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		isJetpack: isJetpackSite( state, siteId ),
		customizerUrl: getCustomizerUrl( state, siteId ),
		generalOptionsUrl: getSiteAdminUrl( state, siteId, 'options-general.php' )
	};
} )( localize( SiteIconSetting ) );
