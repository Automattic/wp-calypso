import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import iconReaderLightbulb from 'calypso/assets/images/customer-home/reader-lightbulb.svg';
import withDimensions from 'calypso/lib/with-dimensions';
import wpcom from 'calypso/lib/wp';
import { trackScrollPage } from 'calypso/reader/controller-helper';
import DiscoverNavigation from 'calypso/reader/discover/discover-navigation';
import {
	DEFAULT_TAB,
	buildDiscoverStreamKey,
	getDiscoverStreamTags,
} from 'calypso/reader/discover/helper';
import Stream from 'calypso/reader/stream';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';

import './style.scss';

interface ReaderCardProps {
	width: number;
}

const ReaderCard = ( props: ReaderCardProps ) => {
	const translate = useTranslate();
	const locale = useLocale();

	const { data: interestTags = [] } = useQuery( {
		queryKey: [ 'read/interests', locale ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: `/read/interests`,
					apiNamespace: 'wpcom/v2',
				},
				{
					_locale: locale,
				}
			),
		select: ( data ) => {
			return data.interests;
		},
	} );

	// Add dailyprompt to the front of interestTags if not present.
	const hasDailyPrompt = interestTags.filter(
		( tag: { slug: string } ) => tag.slug === 'dailyprompt'
	).length;
	if ( ! hasDailyPrompt ) {
		interestTags.unshift( { title: translate( 'Daily prompts' ), slug: 'dailyprompt' } );
	}

	const queryParams = new URLSearchParams( window.location.search );
	const selectedTab = queryParams.get( 'selectedTab' ) || DEFAULT_TAB;

	const followedTags = useSelector( getReaderFollowedTags );
	const isLoggedIn = useSelector( isUserLoggedIn );
	// Do not supply a fallback empty array as null is good data for getDiscoverStreamTags.
	const recommendedStreamTags = getDiscoverStreamTags(
		followedTags && followedTags.map( ( tag ) => tag.slug ),
		isLoggedIn
	);
	const streamKey = buildDiscoverStreamKey( selectedTab, recommendedStreamTags );

	return (
		<>
			<div className="reader-card customer-home__card">
				<div className="reader-card__header">
					<h2 className="reader-card__title">
						<div className="reader-card__title-icon">
							<img src={ iconReaderLightbulb } alt="" />
						</div>
						<span>{ translate( 'Increase Views by Engaging with Others' ) }</span>
					</h2>
					<span className="reader-card__subtitle">
						{ translate(
							'You have more chances to pomp up your views when joining new conversations.'
						) }
					</span>
				</div>
				<DiscoverNavigation
					width={ props.width }
					selectedTab={ selectedTab }
					recommendedTags={ interestTags }
				/>
				<Stream
					streamKey={ streamKey }
					trackScrollPage={ trackScrollPage.bind( null ) }
					useCompactCards={ true }
					isDiscoverStream={ true }
					suppressSiteNameLink={ true }
				/>
			</div>
		</>
	);
};

export default withDimensions( ReaderCard );
