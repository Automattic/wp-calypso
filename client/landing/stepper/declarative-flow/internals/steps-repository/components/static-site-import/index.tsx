import { useLocale } from '@automattic/i18n-utils';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { useSubmitMigrationTicket } from 'calypso/landing/stepper/hooks/use-submit-migration-ticket';
import { getPlatformName, getSourceHost, toSourceUrl } from './utils';
import type { ReactNode } from 'react';

export * from './confidence';
export * from './utils';

export const useStaticSiteImportSource = () => {
	const query = useQuery();
	const from = query.get( 'from' ) ?? '';

	return {
		sourceUrl: toSourceUrl( from ),
		host: getSourceHost( from ),
		platformName: getPlatformName( query.get( 'platform' ) ),
	};
};

export const useStaticSiteImportTicket = () => {
	const locale = useLocale();
	const { siteSlug } = useSiteData();
	const { sourceUrl } = useStaticSiteImportSource();
	const { sendTicketAsync, isPending, isError } = useSubmitMigrationTicket();

	const sendTicket = ( context: string ) =>
		sendTicketAsync( { locale, blog_url: siteSlug, from_url: sourceUrl, context } );

	return { sendTicket, isPending, isError };
};

export const ImportCard = ( { title, children }: { title?: ReactNode; children: ReactNode } ) => (
	<Card>
		<CardBody size="large">
			<VStack spacing={ 6 } alignment="stretch">
				{ title && (
					<Heading level={ 2 } size={ 20 } weight={ 600 }>
						{ title }
					</Heading>
				) }
				{ children }
			</VStack>
		</CardBody>
	</Card>
);

export const SourceCard = () => {
	const { __ } = useI18n();
	const { host, platformName } = useStaticSiteImportSource();

	if ( ! host ) {
		return null;
	}

	return (
		<Card size="small">
			<CardBody>
				<HStack wrap>
					<span>{ host }</span>
					{ platformName && (
						<Text variant="muted">
							{ sprintf(
								/* translators: %s: the platform the site is hosted on today, e.g. Wix. */
								__( 'Hosted with %s' ),
								platformName
							) }
						</Text>
					) }
				</HStack>
			</CardBody>
		</Card>
	);
};
