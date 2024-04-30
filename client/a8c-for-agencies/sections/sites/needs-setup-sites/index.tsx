import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutColumn from 'calypso/a8c-for-agencies/components/layout/column';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import SitesHeaderActions from '../sites-header-actions';
import NeedSetupTable from './table';

export default function NeedSetup() {
	const translate = useTranslate();

	const title = translate( 'Sites' );

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

				<NeedSetupTable
					availablePlans={ [
						{
							name: translate( 'WordPress.com Creator' ),
							available: 1,
						},
					] }
				/>
			</LayoutColumn>
		</Layout>
	);
}
