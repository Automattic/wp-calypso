import languages from '@automattic/languages';
import ReactDom from 'react-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import LanguagePicker from 'calypso/components/language-picker';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { setUserSetting } from 'calypso/state/user-settings/actions';
import { saveUnsavedUserSettings } from 'calypso/state/user-settings/thunks';

import './style.scss';

export function AccountSettingsHelper() {
	const dispatch = useDispatch();
	const userSettings = useSelector( getUserSettings ) ?? {};
	const updateLanguage = async ( event ) => {
		const { value } = event.target;
		dispatch( setUserSetting( 'language', value ) );
		dispatch( saveUnsavedUserSettings( [ 'language' ] ) ).then( () => {
			window.location.reload();
		} );
	};
	return (
		<>
			<QueryUserSettings />
			<div>Account Settings</div>
			<div className="account-settings-helper__popover">
				<LanguagePicker
					languages={ languages }
					valueKey="langSlug"
					value={ userSettings?.locale_variant || userSettings.language || '' }
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
