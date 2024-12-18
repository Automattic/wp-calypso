import { useTranslate } from 'i18n-calypso';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MIGRATIONS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { TaskSteps } from 'calypso/a8c-for-agencies/components/task-steps';
import useGetTipaltiPayee from 'calypso/a8c-for-agencies/sections/referrals/hooks/use-get-tipalti-payee';
import Layout from 'calypso/layout/multi-sites-dashboard';
import LayoutBody from 'calypso/layout/multi-sites-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/multi-sites-dashboard/header';
import LayoutTop from 'calypso/layout/multi-sites-dashboard/top';
import { getMigrationInfo } from './migration-info';

import './style.scss';

const SelfMigrationTool = ( { type }: { type: 'pressable' | 'wpcom' } ) => {
	const translate = useTranslate();

	const stepInfo = getMigrationInfo( type, translate );
	const { data: tipaltiData } = useGetTipaltiPayee();

	const { pageTitle, heading, pageHeading, pageSubheading, steps, sessionStorageKey } = stepInfo;

	const stepsWithCompletion = steps.reduce( ( acc, step ) => {
		// Remove the step to add the bank info if already added
		if ( tipaltiData.IsPayable && step.stepId === 'add-bank-info' ) {
			return acc;
		}
		acc.push( {
			...step,
			isCompleted: false,
		} as never );
		return acc;
	}, [] );

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
				<TaskSteps
					heading={ pageHeading }
					subheading={ pageSubheading }
					steps={ stepsWithCompletion }
					sessionStorageKey={ sessionStorageKey }
				/>
			</LayoutBody>
		</Layout>
	);
};

export default SelfMigrationTool;
