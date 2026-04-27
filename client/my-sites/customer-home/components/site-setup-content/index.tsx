import { CircularProgressBar } from '@automattic/components';
import { useSortedLaunchpadTasks } from '@automattic/data-stores';
import { Launchpad, type Task } from '@automattic/launchpad';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import { useSelector } from 'calypso/state';
import { getSite, getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';

import './style.scss';

const LAUNCHPAD_CONTEXT = 'site-setup';

export default function SiteSetupContent() {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state: AppState ) => getSiteSlug( state, siteId ) ?? '' );
	const site = useSelector( ( state: AppState ) => getSite( state, siteId ) );
	const checklistSlug = ( site?.options as { site_intent?: string } )?.site_intent ?? '';

	const {
		data: { checklist, title },
	} = useSortedLaunchpadTasks( siteSlug, checklistSlug, LAUNCHPAD_CONTEXT );

	const numberOfSteps = checklist?.length ?? 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) ?? [] ).length;

	return (
		<>
			<NavigationHeader
				compactBreadcrumb={ false }
				navigationItems={ [] }
				mobileItem={ null }
				title={ translate( 'Site Setup' ) }
			>
				<Button variant="secondary">{ translate( 'Personalized checklist' ) }</Button>
			</NavigationHeader>
			<div className="site-setup-content">
				<div className="site-setup-content__card">
					<div className="site-setup-content__card-header">
						<h2 className="site-setup-content__card-title">
							{ title ?? translate( 'Get started with your site' ) }
						</h2>
						{ numberOfSteps > 0 && (
							<div className="site-setup-content__progress">
								<span className="site-setup-content__progress-label">
									{ translate( '%(completed)d/%(total)d completed', {
										args: { completed: completedSteps, total: numberOfSteps },
									} ) }
								</span>
								<CircularProgressBar
									size={ 40 }
									enableDesktopScaling
									numberOfSteps={ numberOfSteps }
									currentStep={ completedSteps }
								/>
							</div>
						) }
					</div>
					<Launchpad
						siteSlug={ siteSlug }
						checklistSlug={ checklistSlug }
						launchpadContext={ LAUNCHPAD_CONTEXT }
					/>
				</div>
			</div>
		</>
	);
}
