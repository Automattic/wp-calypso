import {
	Button,
	Card,
	Flex,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import connectSite from 'calypso/lib/reader-connect-site';
import {
	getSiteName,
	getSiteDescription,
	getSiteUrl,
	getSiteDomain,
} from 'calypso/reader/get-helpers';
import { Feed } from 'calypso/state/data-layer/wpcom/read/feed/types';
import { Site } from 'calypso/state/data-layer/wpcom/read/sites/types';

type RecommendedSiteProps = {
	siteTitle: string;
	siteUrl: string;
	siteDomain: string;
	siteDescription: string;
	siteIcon?: string;
	feedIcon?: string;
};

const RecommendedSite = ( {
	siteTitle,
	siteDescription,
	siteDomain,
	siteUrl,
	siteIcon,
	feedIcon,
}: RecommendedSiteProps ) => {
	const translate = useTranslate();
	return (
		<Card className="recommended-site" as="li">
			<Flex justify="flex-end">
				<Button className="recommended-site__close-button" icon={ close } iconSize={ 20 } />
			</Flex>
			<HStack justify="flex-start" spacing="4">
				{
					<ReaderAvatar
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						siteIcon={ siteIcon }
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						feedIcon={ feedIcon }
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						isCompact
					/>
				}
				<VStack spacing={ 0 }>
					{ siteTitle && <h3 className="recommended-site__site-title">{ siteTitle }</h3> }
					{ siteUrl && (
						<a href={ siteUrl } className="recommended-site__site-url">
							{ siteDomain }
						</a>
					) }
				</VStack>
			</HStack>
			<p className="recommended-site__site-description">{ siteDescription }</p>
			<Button isPrimary className="recommended-site__subscribe-button">
				{ translate( 'Subscribe' ) }
			</Button>
		</Card>
	);
};

type ConnectSiteComponentProps = {
	siteId?: number;
	feedId?: number;
	site?: Site;
	feed?: Feed;
};

const RecommendedSiteWithConnectedSite = ( { site, feed }: ConnectSiteComponentProps ) => {
	if ( ! site ) {
		// todo: display loading state
		return <div>Site is required</div>;
	}

	const siteTitle = getSiteName( { site, feed } );
	const siteDescription = getSiteDescription( { site, feed } );
	const siteDomain = getSiteDomain( { site, feed } );
	const siteUrl = getSiteUrl( { site, feed } );
	const siteIcon = site.icon?.img;
	const feedIcon = feed?.image;

	return (
		<RecommendedSite
			siteTitle={ siteTitle }
			siteDescription={ siteDescription }
			siteDomain={ siteDomain }
			siteUrl={ siteUrl }
			siteIcon={ siteIcon }
			feedIcon={ feedIcon }
		/>
	);
};

export default connectSite(
	RecommendedSiteWithConnectedSite
) as React.FC< ConnectSiteComponentProps >;
