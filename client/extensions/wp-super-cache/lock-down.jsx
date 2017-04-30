/**
 * External dependencies
 */
import React from 'react';
import { pick } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import FormToggle from 'components/forms/form-toggle/compact';
import ClipboardButton from 'components/forms/clipboard-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import WrapSettingsForm from './wrap-settings-form';
import Notice from 'components/notice';

const LockDown = ( {
	fields: {
		lock_down,
	},
	handleAutosavingToggle,
	isRequesting,
	isSaving,
	translate,
} ) => {
	const lockdownCodeSnippet = translate(
		'if ( defined( \'WPLOCKDOWN\' ) && constant( \'WPLOCKDOWN\' ) ) { echo ' +
		'"Sorry. My blog is locked down. Updates will appear shortly"; }'
	);

	return (
		<div>
			<SectionHeader label="Lock Down" />
			<Card>
				<form>
					<FormFieldset>
						<FormToggle
							checked={ !! lock_down }
							disabled={ isRequesting || isSaving }
							onChange={ handleAutosavingToggle( 'lock_down' ) }>
							<span>
								{ translate( 'Enable lock down to prepare your server for an expected spike in traffic.' ) }
							</span>
						</FormToggle>
					</FormFieldset>

					<div className="wp-super-cache__lock-down-container">
						<FormSettingExplanation className="wp-super-cache__lock-down-explanation">
								{ translate(
									'When this is enabled, new comments on a post will not refresh the cached static files.'
								) }
						</FormSettingExplanation>

						<FormSettingExplanation className="wp-super-cache__lock-down-explanation">
							{ translate(
								'Developers: Make your plugin lock down compatible by checking the "WPLOCKDOWN" ' +
								'constant. The following code will make sure your plugin respects the WPLOCKDOWN setting.'
							) }
						</FormSettingExplanation>

						<FormSettingExplanation className="wp-super-cache__lock-down-code-block">
							<ClipboardButton
								className="wp-super-cache__lock-down-code-block-button"
								text={ lockdownCodeSnippet }>
								<Gridicon icon="clipboard" />
							</ClipboardButton>
							<span className="wp-super-cache__lock-down-code-block-snippet">{ lockdownCodeSnippet }</span>
						</FormSettingExplanation>

						<Notice
							isCompact={ true }
							className="wp-super-cache__lock-down-notice"
							status={ lock_down ? 'is-warning' : 'is-info' }
							text={ lock_down
								? translate( 'WordPress is locked down. Super Cache static files will not be deleted ' +
									'when new comments are made.' )
								: translate( 'WordPress is not locked down. New comments will refresh Super Cache ' +
									'static files as normal.' )
						}
						/>
					</div>
				</form>
			</Card>
		</div>
	);
};

const getFormSettings = settings => {
	return pick( settings, [
		'lock_down',
	] );
};

export default WrapSettingsForm( getFormSettings )( LockDown );
