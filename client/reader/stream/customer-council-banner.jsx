import { readFeedSiteQuery, readTeamsQuery } from '@automattic/api-queries';
import { SubscriptionManager } from '@automattic/data-stores';
import { useQuery } from '@tanstack/react-query';
import Banner from 'calypso/components/banner';
import { navigate } from 'calypso/lib/navigate';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';

const CUSTOMER_COUNCIL_P2_URL = 'https://readercouncilgeneral.wordpress.com/';
const CUSTOMER_COUNCIL_P2_ID = '237686330';

export const CustomerCouncilBanner = ( { translate } ) => {
	const { mutate: subscribe, isIdle: notActivelySubscribing } =
		SubscriptionManager.useSiteSubscribeMutation();

	const {
		data: p2,
		isFetched: checkedAlreadySubscribed,
		isFetching: checkingAlreadySubscribed,
	} = useQuery( readFeedSiteQuery( Number( CUSTOMER_COUNCIL_P2_ID ) ) );
	const alreadySubscribed = p2?.is_following;

	const { data: teamsData } = useQuery( readTeamsQuery() );
	const isAutomattician = isAutomatticTeamMember( teamsData?.teams ?? [] );

	const hideBanner =
		isAutomattician ||
		( alreadySubscribed && checkedAlreadySubscribed ) ||
		checkingAlreadySubscribed;

	if ( hideBanner ) {
		return null;
	}

	const subscribeToP2AndNavigate = () => {
		subscribe(
			{ blog_id: CUSTOMER_COUNCIL_P2_ID, url: CUSTOMER_COUNCIL_P2_URL },
			{
				onSettled: () => {
					navigate( CUSTOMER_COUNCIL_P2_URL );
				},
			}
		);
	};

	return (
		<Banner
			horizontal
			callToAction={
				notActivelySubscribing ? translate( 'Subscribe' ) : `${ translate( 'Subscribing' ) }...`
			}
			disableHref
			dismissPreferenceName="reader-council-banner"
			dismissTemporary
			title={ translate( 'Want to shape the future of the WordPress.com Reader?' ) }
			onClick={ subscribeToP2AndNavigate }
			description={ translate(
				'Join {{a}}our new blog{{/a}} to share your feedback and help us improve your reading experience.',
				{
					components: {
						a: <a href={ CUSTOMER_COUNCIL_P2_URL } />,
					},
				}
			) }
		/>
	);
};
