import { UniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import useI18nCalypsoTranslations from '../shared/use-i18n-calypso-translations';
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

export default function Edit() {
	useI18nCalypsoTranslations();
	return <UniversalNavbarFooter currentRoute="/" isLoggedIn onLanguageChange={ noop } />;
}
