import { Reader, SubscriptionManager } from '@automattic/data-stores';
import Banner from 'calypso/components/banner';
import { navigate } from 'calypso/lib/navigate';

export const CustomerCouncilBanner = ( { translate } ) => {
	const CUSTOMER_COUNCIL_P2_URL = 'https://readercouncilgeneral.wordpress.com/';
	const CUSTOMER_COUNCIL_P2_ID = '237686330';

	const { mutate: subscribe, isIdle: notActivelySubscribing } =
		SubscriptionManager.useSiteSubscribeMutation();

	const {
		data: p2,
		isFetched: checkedAlreadySubscribed,
		isFetching: checkingAlreadySubscribed,
	} = Reader.useReadFeedSiteQuery( Number( CUSTOMER_COUNCIL_P2_ID ) );
	const alreadySubscribed = p2?.is_following;

	const hideBanner = ( alreadySubscribed && checkedAlreadySubscribed ) || checkingAlreadySubscribed;

	if ( hideBanner ) {
		return null;
	}

	const subscribeToP2AndNavigate = () => {
		subscribe(
			{ blog_id: CUSTOMER_COUNCIL_P2_URL, url: CUSTOMER_COUNCIL_P2_URL },
			{
				onSettled: () => {
					navigate( CUSTOMER_COUNCIL_P2_URL );
				},
			}
		);
	};

	return (
		<Banner
			callToAction={
				notActivelySubscribing ? translate( 'Subscribe' ) : `${ translate( 'Subscribing' ) }...`
			}
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
