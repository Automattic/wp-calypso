import { UniversalNavbarFooter } from '@automattic/wpcom-template-parts';
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

export default function Edit() {
	return <UniversalNavbarFooter currentRoute="/" isLoggedIn onLanguageChange={ noop } />;
}
