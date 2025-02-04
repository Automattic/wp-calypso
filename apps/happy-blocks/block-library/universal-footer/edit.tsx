import { PureUniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import { useBlockProps } from '@wordpress/block-editor';
import useI18nCalypsoTranslations from '../shared/use-i18n-calypso-translations';
import { FooterAttributes } from './types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

export default function Edit( { attributes }: FooterAttributes ) {
	useI18nCalypsoTranslations();

	const locale = attributes.locale;

	return (
		<div { ...useBlockProps() }>
			<PureUniversalNavbarFooter locale={ locale } isLoggedIn onLanguageChange={ noop } />
		</div>
	);
}
