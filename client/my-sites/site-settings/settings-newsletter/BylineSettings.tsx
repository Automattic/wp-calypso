import { Gravatar, FormLabel } from '@automattic/components';
import { ToggleControl, Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import {
	getLocalizedDate,
	phpToMomentDatetimeFormat,
} from 'calypso/my-sites/site-settings/date-time-format/utils';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { BylinePreview } from './BylinePreview';

const GRAVATER_OPTION = 'jetpack_gravatar_in_email';
const AUTHOR_OPTION = 'jetpack_author_in_email';
const POST_DATE_OPTION = 'jetpack_post_date_in_email';

type BylineSettingsProps = {
	showAvatarValue?: boolean;
	showAuthorValue?: boolean;
	showDateValue?: boolean;
	handleToggle: ( field: string ) => ( value: boolean ) => void;
	disabled?: boolean;
	dateFormat?: string;
};

export const BylineSettings = ( {
	showAvatarValue,
	showAuthorValue,
	showDateValue,
	handleToggle,
	disabled,
	dateFormat = 'F j, Y',
}: BylineSettingsProps ) => {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const user = useSelector( getCurrentUser );
	const siteSlug = site?.slug || '';

	const localizedDate = getLocalizedDate( 'UTC', dateFormat );

	return (
		<>
			<FormLabel className="increase-margin-bottom-fix">
				{ translate( 'For each new post email, include' ) }
			</FormLabel>
			<p></p>
			<BylinePreview
				isGravatarEnabled={ !! showAvatarValue }
				isAuthorEnabled={ !! showAuthorValue }
				isPostDateEnabled={ !! showDateValue }
				dateExample={ phpToMomentDatetimeFormat( localizedDate, dateFormat ) }
				user={ user }
			/>
			<ToggleControl
				checked={ !! showAvatarValue }
				onChange={ handleToggle( GRAVATER_OPTION ) }
				disabled={ disabled }
				label={ translate( 'Show author avatar on your emails' ) }
			/>
			{ !! showAvatarValue && (
				<div className="byline-settings__gravatar-preview">
					<Gravatar className="byline-settings__gravatar" user={ user } size={ 60 } />
					<div>
						<FormSettingExplanation>
							{ translate(
								'We use Gravatar, a service that associates an avatar image with your primary email address.'
							) }
						</FormSettingExplanation>
						<Button variant="secondary" href="/me">
							{ translate( 'Update your Gravatar' ) }
						</Button>
					</div>
				</div>
			) }
			<ToggleControl
				checked={ !! showAuthorValue }
				onChange={ handleToggle( AUTHOR_OPTION ) }
				disabled={ disabled }
				label={ translate( 'Show author display name' ) }
			/>
			<ToggleControl
				checked={ !! showDateValue }
				onChange={ handleToggle( POST_DATE_OPTION ) }
				disabled={ disabled }
				label={ translate( 'Add the post date' ) }
			/>
			{ !! showDateValue && (
				<FormSettingExplanation className="byline-settings__show-date">
					{ translate(
						'You can customize the date format in your site’s {{link}}general settings{{/link}}',
						{
							components: {
								link: <a href={ `/settings/writing/${ siteSlug }` } />,
							},
						}
					) }
				</FormSettingExplanation>
			) }
		</>
	);
};
