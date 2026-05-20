import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { brush } from '@wordpress/icons';
import A4AEmptyState from 'calypso/a8c-for-agencies/components/a4a-empty-state';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import { PageBodyPlaceholder } from 'calypso/a8c-for-agencies/components/page-placeholder';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/layout/hosting-dashboard/header';
import useAgentStudioOutput from '../../data/use-agent-studio-output';
import { getAgentStudioPath } from '../../lib/paths';
import OutputDetailContent from './output-detail-content';

import './style.scss';

interface Props {
	outputId: string;
}

export default function AgentStudioOutputDetail( { outputId }: Props ) {
	const { data: output, isLoading } = useAgentStudioOutput( outputId );

	return (
		<Layout
			title={ output?.title ?? __( 'Deliverable' ) }
			wide
			className="a4a-agent-studio-output-detail"
		>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						hideOnMobile
						items={ [
							{ label: __( 'Agent studio' ), href: getAgentStudioPath() },
							{ label: __( 'Deliverable' ) },
						] }
					/>
					<Actions>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				{ isLoading && <PageBodyPlaceholder /> }
				{ ! isLoading && ! output && (
					<A4AEmptyState
						icon={ brush }
						title={ __( 'Deliverable not found' ) }
						description={ __( 'This deliverable doesn’t exist. It may have been deleted.' ) }
					>
						<Button variant="primary" href={ getAgentStudioPath() }>
							{ __( 'Back to Agent studio' ) }
						</Button>
					</A4AEmptyState>
				) }
				{ ! isLoading && output && <OutputDetailContent output={ output } /> }
			</LayoutBody>
		</Layout>
	);
}
