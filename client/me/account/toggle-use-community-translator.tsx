import { ToggleControl, ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ENABLE_TRANSLATOR_KEY } from 'calypso/lib/i18n-utils/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { saveUserSettings } from 'calypso/state/user-settings/actions';
import { isUpdatingUserSettings } from 'calypso/state/user-settings/selectors';

function ToggleUseCommunityTranslator() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const enableTranslator = useSelector( ( state ) =>
		getUserSetting( state, ENABLE_TRANSLATOR_KEY )
	);

	const isSaving = useSelector( isUpdatingUserSettings );

	const handleToggle = ( isChecked: boolean ) => {
		dispatch( saveUserSettings( { [ ENABLE_TRANSLATOR_KEY ]: isChecked } ) );
	};

	const handleLearnMoreClick = () => {
		dispatch( recordGoogleEvent( 'Me', 'Clicked on Community Translator Learn More Link' ) );
	};

	return (
		<div>
			<ToggleControl
				checked={ !! enableTranslator }
				onChange={ handleToggle }
				disabled={ isSaving }
				label={ translate( 'Enable the in-page translator where available. {{a}}Learn more{{/a}}', {
					components: {
						a: (
							<ExternalLink
								href="https://translate.wordpress.com/community-translator/"
								onClick={ handleLearnMoreClick }
								children={ null }
							/>
						),
					},
				} ) }
			/>
		</div>
	);
}
export default ToggleUseCommunityTranslator;
