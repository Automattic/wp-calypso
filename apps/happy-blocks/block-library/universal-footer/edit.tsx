import { PureUniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import { useBlockProps } from '@wordpress/block-editor';
import useI18nCalypsoTranslations from '../shared/use-i18n-calypso-translations';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

export default function Edit() {
	useI18nCalypsoTranslations();
	return (
		<div { ...useBlockProps() }>
			<PureUniversalNavbarFooter currentRoute="/" isLoggedIn onLanguageChange={ noop } />
		</div>
	);
}
