import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MIGRATIONS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { getMigrationInfo } from './migration-info';

const SelfMigrationTool = ( { type }: { type: 'pressable' | 'wpcom' } ) => {
	const translate = useTranslate();

	const stepInfo = getMigrationInfo( type, translate );

	if ( ! stepInfo ) {
		return null;
	}

	const { pageTitle, heading } = stepInfo;

	return (
		<Layout className="self-migration-tool" title={ pageTitle } wide>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						hideOnMobile
						items={ [
							{
								label: translate( 'Migrations' ),
								href: A4A_MIGRATIONS_LINK,
							},
							{
								label: translate( 'Overview' ),
							},
							{
								label: heading,
							},
						] }
					/>
					<Actions useColumnAlignment>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<></>
			</LayoutBody>
		</Layout>
	);
};

export default SelfMigrationTool;
