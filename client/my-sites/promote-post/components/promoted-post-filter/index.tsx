import { useMemo } from 'react';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import './style.scss';
import { SmartStatuses } from 'calypso/my-sites/promote-post/components/promoted-post-list';
import { CampaignStatus } from 'calypso/state/promote-post/selectors';

type Props = {
	statuses: { status: CampaignStatus; count: number }[];
	selectedStatus: CampaignStatus;
	selectStatus: ( status: CampaignStatus ) => void;
};

export default function PromotedPostFilter( { statuses, selectedStatus, selectStatus }: Props ) {
	const total = useMemo( () => {
		return statuses.map( ( { count } ) => count ).reduce( ( a, b ) => a + b, 0 );
	}, [ statuses ] );

	return (
		<SectionNav>
			<NavTabs>
				<NavItem
					key={ 'All' }
					count={ total }
					onClick={ () => selectStatus( -1 ) }
					selected={ selectedStatus === -1 }
					children={ 'All' }
				/>
				{ statuses.map( ( { status, count } ) => {
					return (
						<NavItem
							key={ status }
							count={ count }
							onClick={ () => selectStatus( status ) }
							selected={ selectedStatus === status }
							children={ SmartStatuses[ status ] }
						/>
					);
				} ) }
			</NavTabs>
		</SectionNav>
	);
}
