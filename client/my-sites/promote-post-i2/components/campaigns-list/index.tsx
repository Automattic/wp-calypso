import { translate, useTranslate } from 'i18n-calypso';
import ListEnd from 'calypso/components/list-end';
import Notice from 'calypso/components/notice';
import { useInfiniteScroll } from 'calypso/data/promote-post/use-infinite-scroll';
import { Campaign } from 'calypso/data/promote-post/use-promote-post-campaigns-query-paged';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import './style.scss';
import { DSPMessage } from 'calypso/my-sites/promote-post-i2/main';
import CampaignsTable from '../campaigns-table';
import EmptyPromotionList from '../empty-promotion-list';
import SearchBar, { SearchOptions } from '../search-bar';

const noCampaignListMessage = translate(
	'There was a problem obtaining the campaign list. Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
	{
		components: {
			contactSupportLink: <a href={ CALYPSO_CONTACT } />,
		},
		comment: 'Validation error when filling out domain checkout contact details form',
	}
);
const ERROR_NO_LOCAL_USER = 'no_local_user';

type Props = {
	isLoading: boolean;
	isError: DSPMessage | null;
	isFetching: boolean;
	fetchNextPage: () => void;
	handleSearchOptions: ( search: SearchOptions ) => void;
	totalCampaigns: number;
	hasMorePages: boolean;
	campaigns?: Campaign[];
};

export default function CampaignsList( props: Props ) {
	const {
		isLoading,
		isError,
		isFetching,
		fetchNextPage,
		handleSearchOptions,
		totalCampaigns,
		hasMorePages,
		campaigns,
	} = props;

	const translate = useTranslate();

	const hasLocalUser = ( isError as DSPMessage )?.errorCode !== ERROR_NO_LOCAL_USER;

	const { containerRef } = useInfiniteScroll( {
		offset: '200px',
		shouldStop: ! hasMorePages || isLoading || isFetching,
		async onLoadMore() {
			await fetchNextPage();
		},
	} );

	const isEmpty = campaigns?.length === 0;

	if ( isError && hasLocalUser ) {
		return (
			<Notice status="is-error" icon="mention">
				{ noCampaignListMessage }
			</Notice>
		);
	}

	return (
		<>
			<SearchBar
				mode="campaigns"
				handleSetSearch={ ( search ) => {
					handleSearchOptions( search );
				} }
			/>

			{ ! isLoading && campaigns?.length === 0 ? (
				<>
					{ totalCampaigns === 0 ? (
						<EmptyPromotionList type="campaigns" />
					) : (
						<>{ translate( 'No campaigns match your search' ) }</>
					) }
				</>
			) : (
				<>
					<div ref={ containerRef }>
						{ campaigns && (
							<CampaignsTable
								campaigns={ campaigns }
								isLoading={ isLoading }
								isFetchingPageResults={ isFetching }
							/>
						) }
					</div>

					{ ! isEmpty && ! isError && (
						<>
							<ListEnd />
						</>
					) }
				</>
			) }
		</>
	);
}
