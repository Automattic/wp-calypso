import { isEnabled } from '@automattic/calypso-config';
import { englishLocales, i18nDefaultLocaleSlug } from '@automattic/i18n-utils';
import { SelectItem, SelectItemAlt } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { build, write, shoppingCart } from 'calypso/signup/icons';

type Intent = SelectItem< string >;
type IntentAlt = SelectItemAlt< string >;

export const useIntents = (): Intent[] => {
	const translate = useTranslate();

	const intents: Intent[] = [
		{
			key: 'write',
			title: translate( 'Write' ),
			description: <p>{ translate( 'Share your ideas with the world' ) }</p>,
			icon: write,
			value: 'write',
			actionText: translate( 'Start writing' ),
		},
		{
			key: 'build',
			title: translate( 'Build' ),
			description: <p>{ translate( 'Begin creating your website' ) }</p>,
			icon: build,
			value: 'build',
			actionText: translate( 'Start building' ),
		},
	];

	if ( isEnabled( 'seller-experience' ) ) {
		intents.push( {
			key: 'sell',
			title: translate( 'Sell' ),
			description: <p>{ translate( 'Set up an online store' ) }</p>,
			icon: shoppingCart,
			value: 'sell',
			actionText: translate( 'Start selling' ),
		} );
	}

	return intents;
};

export const useIntentsAlt = ( canImport: boolean ): IntentAlt[] => {
	const translate = useTranslate();

	return [
		{
			show: isEnabled( 'onboarding/import' ),
			key: 'import',
			description: translate( 'Already have an existing website?' ),
			value: 'import',
			actionText: translate( 'Import your site content' ),
			disable: ! canImport,
			disableText: translate(
				"You're not authorized to import content.{{br/}}Please check with your site admin.",
				{
					components: {
						br: <br />,
					},
				}
			),
		},
		{
			show: englishLocales.includes( translate.localeSlug || i18nDefaultLocaleSlug ),
			key: 'difm',
			description: translate( 'Hire our experts to create your dream site' ),
			value: 'difm',
			actionText: translate( 'Get Started' ),
			disable: false,
			disableText: <></>,
		},
	];
};
