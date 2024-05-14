import { Onboard } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { Intent } from './types';

export const useIntents = (): Intent[] => {
	const translate = useTranslate();
	const SiteIntent = Onboard.SiteIntent;

	const intents: Intent[] = [
		{
			key: SiteIntent.Write,
			title: translate( 'Creating a site for yourself, a business, or a friend' ),
			description: translate( 'Everything you need to build a website and grow your audience.' ),
			value: SiteIntent.Write,
		},
		{
			key: SiteIntent.Build,
			title: translate( 'Creating a site for a client' ),
			description: translate(
				'Ideal for freelancers, agencies or developers seeking to manage one or more sites.'
			),
			value: SiteIntent.Build,
		},
		{
			key: SiteIntent.Import,
			title: translate( 'Migrating or importing an existing site' ),
			description: translate(
				'Bring your site from another platform just by following few simple steps.'
			),
			value: SiteIntent.Import,
		},
	];

	return intents;
};
