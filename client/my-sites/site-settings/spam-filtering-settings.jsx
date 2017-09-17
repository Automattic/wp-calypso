/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import FoldableCard from 'components/foldable-card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormInputValidation from 'components/forms/form-input-validation';
import Gridicon from 'gridicons';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getJetpackSettingsSaveError, getJetpackSettingsSaveRequestStatus } from 'state/selectors';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import { hasFeature } from 'state/sites/plans/selectors';
import {
	FEATURE_SPAM_AKISMET_PLUS,
	PLAN_JETPACK_PERSONAL,
} from 'lib/plans/constants';

const SpamFilteringSettings = ( {
	currentAkismetKey,
	dirtyFields,
	fields,
	hasAkismetFeature,
	hasAkismetKeyError,
	isRequestingSettings,
	isSavingSettings,
	onChangeField,
	translate,
} ) => {
	const { akismet: akismetActive, wordpress_api_key } = fields;
	const isStoredKey = wordpress_api_key === currentAkismetKey;
	const isDirty = includes( dirtyFields, 'wordpress_api_key' );
	const inTransition = isRequestingSettings || isSavingSettings;
	const isValidKey =
		( wordpress_api_key && isStoredKey ) ||
		( wordpress_api_key && isDirty && isStoredKey && ! hasAkismetKeyError );
	const isInvalidKey = isDirty && hasAkismetKeyError && ! isStoredKey;
	let validationText, className, header = null;

	if ( ! inTransition && ! hasAkismetFeature && ! isValidKey ) {
		return (
			<Banner
				description={ translate( 'Detect and tweeze spam automatically, with Akismet.' ) }
				event={ 'calypso_akismet_settings_upgrade_nudge' }
				feature={ FEATURE_SPAM_AKISMET_PLUS }
				plan={ PLAN_JETPACK_PERSONAL }
				title={ translate( 'Defend your site against spam! Upgrade to Jetpack Personal.' ) }
			/>
		);
	}

	if ( ! inTransition && isValidKey ) {
		validationText = translate( 'Your Antispam key is valid.' );
		className = 'is-valid';
		header = (
			<div>
				<Gridicon icon="checkmark" />
				{ translate( 'Your site is protected from spam.' ) }
			</div>
		);
	}
	if ( ! inTransition && isInvalidKey ) {
		validationText = translate( "There's a problem with your Antispam API key." );
		className = 'is-error';
		header = (
			<div>
				<Gridicon icon="notice-outline" />
				{ translate( 'Your site needs an Antispam key.' ) }
			</div>
		);
	}
	return (
		<FoldableCard
			header={ header }
			className="spam-filtering__foldable-card site-settings__foldable-card"
		>
			<FormFieldset>
				<div className="spam-filtering__settings site-settings__child-settings">
					<div className="spam-filtering__info-link-container site-settings__info-link-container">
						<InfoPopover>
							<ExternalLink
								target="_blank"
								icon
								href={ 'https://jetpack.com/features/security/spam-filtering/' }
							>
								{ translate( 'Learn more about spam filtering.' ) }
							</ExternalLink>
						</InfoPopover>
					</div>
					<FormLabel htmlFor="wordpress_api_key">{ translate( 'Your API Key' ) }</FormLabel>
					<FormTextInput
						name="wordpress_api_key"
						className={ className }
						value={ wordpress_api_key }
						disabled={ inTransition || ! akismetActive }
						onChange={ onChangeField( 'wordpress_api_key' ) }
					/>
					{ ( isValidKey || isInvalidKey ) &&
						! inTransition &&
						<FormInputValidation isError={ isInvalidKey } text={ validationText } /> }
					{ ( ! wordpress_api_key || isInvalidKey || ! isValidKey ) &&
						<FormSettingExplanation>
							{ translate(
								"If you don't already have an API key, then" +
									' {{link}}get your API key here{{/link}},' +
									" and you'll be guided through the process of getting one in a new window.",
								{
									components: {
										link: (
											<ExternalLink icon href="https://akismet.com/wordpress/" target="_blank" />
										),
									},
								}
							) }
						</FormSettingExplanation> }
				</div>
			</FormFieldset>
		</FoldableCard>
	);
};

SpamFilteringSettings.propTypes = {
	dirtyFields: PropTypes.array,
	fields: PropTypes.object,
	hasAkismetKeyError: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	isSavingSettings: PropTypes.bool,
	settings: PropTypes.object,
};

export default connect( state => {
	const selectedSiteId = getSelectedSiteId( state );
	const jetpackSettingsSaveError = getJetpackSettingsSaveError( state, selectedSiteId );
	const jetpackSettingsSaveStatus = getJetpackSettingsSaveRequestStatus( state, selectedSiteId );
	const hasAkismetKeyError =
		jetpackSettingsSaveStatus &&
		jetpackSettingsSaveStatus === 'error' &&
		includes( jetpackSettingsSaveError, 'wordpress_api_key' );
	const hasAkismetFeature = hasFeature( state, selectedSiteId, FEATURE_SPAM_AKISMET_PLUS );

	return {
		hasAkismetFeature,
		hasAkismetKeyError,
	};
} )( localize( SpamFilteringSettings ) );
