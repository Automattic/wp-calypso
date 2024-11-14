import languages from '@automattic/languages';
import ReactDom from 'react-dom';
import { useInView } from 'react-intersection-observer';
import { Provider, useDispatch, useSelector } from 'react-redux';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import LanguagePicker from 'calypso/components/language-picker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import ReauthRequired from 'calypso/me/reauth-required';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { setUserSetting } from 'calypso/state/user-settings/actions';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import { saveUnsavedUserSettings } from 'calypso/state/user-settings/thunks';

import './style.scss';

export function AccountSettingsHelper() {
	const dispatch = useDispatch();
	const userSettings = useSelector( getUserSettings ) ?? {};
	const isFetching = useSelector( isFetchingUserSettings );
	const { ref, inView } = useInView( { triggerOnce: true } );

	const updateLanguage = ( event ) => {
		const { value, empathyMode, useFallbackForIncompleteLanguages } = event.target;
		if ( typeof empathyMode !== 'undefined' ) {
			dispatch( setUserSetting( 'i18n_empathy_mode', empathyMode ) );
		}
		if ( typeof useFallbackForIncompleteLanguages !== 'undefined' ) {
			dispatch(
				setUserSetting( 'use_fallback_for_incomplete_languages', useFallbackForIncompleteLanguages )
			);
		}
		dispatch( setUserSetting( 'language', value ) );
		dispatch(
			saveUnsavedUserSettings( [
				'i18n_empathy_mode',
				'use_fallback_for_incomplete_languages',
				'language',
			] )
		).then( () => {
			window.location.reload();
		} );
	};
	return (
		<>
			<QueryUserSettings />
			<div>Account Settings</div>
			<div ref={ ref } className="account-settings-helper__popover">
				<div>Language Picker</div>
				{ inView && <ReauthRequired twoStepAuthorization={ twoStepAuthorization } /> }
				<LanguagePicker
					isLoading={ isFetching }
					languages={ languages }
					valueKey="langSlug"
					value={ userSettings?.locale_variant || userSettings.language || '' }
					empathyMode={ userSettings?.i18n_empathy_mode }
					useFallbackForIncompleteLanguages={ userSettings?.use_fallback_for_incomplete_languages }
					onChange={ updateLanguage }
				/>
			</div>
		</>
	);
}
export default ( element, store ) =>
	ReactDom.render(
		<Provider store={ store }>
			<AccountSettingsHelper />
		</Provider>,
		element
	);
