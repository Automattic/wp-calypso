import { getLanguage, isAITranslatedLocale, isDefaultLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import Banner from 'calypso/components/banner';
import QueryLocaleSuggestions from 'calypso/components/data/query-locale-suggestions';
import { useSelector } from 'calypso/state';
import getLocaleSuggestions from 'calypso/state/selectors/get-locale-suggestions';

const BANNER_NAME = 'ai_translations_banner';

export default function AITranslationsBanner() {
	const translate = useTranslate();
	const localeSuggestions = useSelector( getLocaleSuggestions );
	const isCurrentlyUsingAITranslatedLocale = isAITranslatedLocale( translate.localeSlug );

	if ( ! isDefaultLocale( translate.localeSlug ) && ! isCurrentlyUsingAITranslatedLocale ) {
		return null;
	}

	if ( ! localeSuggestions ) {
		return <QueryLocaleSuggestions />;
	}

	if ( ! isAITranslatedLocale( localeSuggestions?.[ 0 ]?.locale ) ) {
		return;
	}

	const language = getLanguage( localeSuggestions?.[ 0 ]?.locale );

	return (
		<Banner
			icon="globe"
			title={ translate( 'WordPress.com is now available in %s!', {
				args: [ language.name ],
			} ) }
			description={ translate(
				"We've added translations for %s, combining AI technology and a human touch. Help us improve by {{feedbackLink}}sharing feedback{{/feedbackLink}}.",
				{
					args: [ language.name ],
					components: {
						feedbackLink: <a href="https://wordpress.com/forums/forum/translations/" />,
					},
				}
			) }
			callToAction={
				! isCurrentlyUsingAITranslatedLocale &&
				translate( 'Switch to %s', { args: [ language.name ] } )
			}
			event={ BANNER_NAME }
			dismissPreferenceName={ BANNER_NAME }
			href="/me/account"
			disableHref={ isCurrentlyUsingAITranslatedLocale }
			horizontal
		/>
	);
}
