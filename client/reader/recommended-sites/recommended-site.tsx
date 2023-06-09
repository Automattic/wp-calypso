import {
	Button,
	Card,
	Flex,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import ReaderAvatar from 'calypso/blocks/reader-avatar';
import { Railcar } from 'calypso/data/marketplace/types';
import connectSite from 'calypso/lib/reader-connect-site';
import {
	getSiteName,
	getSiteDescription,
	getSiteUrl,
	getSiteDomain,
} from 'calypso/reader/get-helpers';
import { Feed } from 'calypso/state/data-layer/wpcom/read/feed/types';
import { Site } from 'calypso/state/data-layer/wpcom/read/sites/types';
import { dismissSite } from 'calypso/state/reader/site-dismissals/actions';
import { recordAction, recordTrackWithRailcar } from '../stats';
import { RecommendedSitePlaceholder } from './placeholder';

const enum RecommendedSiteEvent {
	Dismissed = 'calypso_reader_recommended_site_dismissed',
}

type RecommendedSiteProps = {
	siteId: number;
	siteTitle: string;
	siteUrl: string;
	siteDomain: string;
	siteDescription: string;
	siteIcon?: string;
	feedIcon?: string;
	railcar?: Railcar;
	displayIndex?: number; // For analytics
};

const RecommendedSite = ( {
	siteId,
	siteTitle,
	siteDescription,
	siteDomain,
	siteUrl,
	siteIcon,
	feedIcon,
	railcar,
	displayIndex,
}: RecommendedSiteProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	return (
		<Card className="recommended-site" as="li">
			<Flex justify="flex-end">
				<Button
					className="recommended-site__dismiss-button"
					icon={ close }
					iconSize={ 20 }
					title={ translate( 'Dismiss this recommendation' ) }
					onClick={ () => {
						recordTrackWithRailcar( RecommendedSiteEvent.Dismissed, railcar, {
							ui_position: displayIndex,
						} );
						recordAction( RecommendedSiteEvent.Dismissed );
						dispatch( dismissSite( siteId ) );
					} }
				/>
			</Flex>
			<HStack justify="flex-start" spacing="4">
				<ReaderAvatar siteIcon={ siteIcon } feedIcon={ feedIcon } isCompact />
				<VStack spacing={ 0 }>
					<h3 className="recommended-site__site-title">{ siteTitle }</h3>
					<a href={ siteUrl } className="recommended-site__site-url">
						{ siteDomain }
					</a>
				</VStack>
			</HStack>
			<p className="recommended-site__site-description">{ siteDescription }</p>
			<Button
				isPrimary
				className="recommended-site__subscribe-button"
				onClick={ () => {
					// todo: subscribe to site
					return undefined;
				} }
			>
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
	railcar?: Railcar;
};

const RecommendedSiteWithConnectedSite = ( {
	siteId,
	site,
	feed,
	railcar,
}: ConnectSiteComponentProps ) => {
	if ( typeof siteId !== 'number' || ! site ) {
		return <RecommendedSitePlaceholder />;
	}

	if ( ! railcar ) {
		throw new Error( 'Railcar is required to render recommended site' );
	}

	const siteTitle = getSiteName( { site, feed } );
	const siteDescription = getSiteDescription( { site, feed } );
	const siteDomain = getSiteDomain( { site, feed } );
	const siteUrl = getSiteUrl( { site, feed } );
	const siteIcon = site.icon?.img;
	const feedIcon = feed?.image;

	return (
		<RecommendedSite
			siteId={ siteId }
			siteTitle={ siteTitle }
			siteDescription={ siteDescription }
			siteDomain={ siteDomain }
			siteUrl={ siteUrl }
			siteIcon={ siteIcon }
			feedIcon={ feedIcon }
			railcar={ railcar }
		/>
	);
};

export default connectSite(
	RecommendedSiteWithConnectedSite
) as React.FC< ConnectSiteComponentProps >;
