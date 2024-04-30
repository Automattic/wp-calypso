import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutColumn from 'calypso/a8c-for-agencies/components/layout/column';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import SitesHeaderActions from '../sites-header-actions';
import NeedSetupTable from './table';

export default function NeedSetup() {
	const translate = useTranslate();

	const title = translate( 'Sites' );

	const { data, isFetching } = useFetchPendingSites();

	const totalAvailableSites = data.filter(
		( { features }: { features: { wpcom_atomic: { state: string } } } ) =>
			features.wpcom_atomic.state === 'pending'
	).length;

	const availablePlans = totalAvailableSites
		? [
				{
					name: translate( 'WordPress.com Creator' ),
					available: totalAvailableSites,
				},
		  ]
		: [];

	return (
		<Layout className="sites-dashboard sites-dashboard__layout preview-hidden" wide title={ title }>
			<LayoutColumn className="sites-overview" wide>
				<LayoutTop>
					<LayoutHeader>
						<Title>{ translate( 'Sites' ) }</Title>
						<Actions>
							<MobileSidebarNavigation />
							<SitesHeaderActions />
						</Actions>
					</LayoutHeader>
				</LayoutTop>

				<NeedSetupTable availablePlans={ availablePlans } isLoading={ isFetching } />
			</LayoutColumn>
		</Layout>
	);
}
