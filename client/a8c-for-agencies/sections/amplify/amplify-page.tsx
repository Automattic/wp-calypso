import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import AmplifyAddSiteModal from './amplify-add-site-modal';
import AmplifyAnalysisModal from './amplify-analysis-modal';
import AmplifyOverviewContent from './amplify-overview-content';
import AmplifyReportsContent from './amplify-reports-content';
import type { ReactNode } from 'react';

export type AmplifyTab = 'overview' | 'reports';

type Props = {
	selectedTab: AmplifyTab;
};

export default function AmplifyPage( { selectedTab }: Props ) {
	const [ isSiteSelectOpen, setIsSiteSelectOpen ] = useState( false );
	const [ analysisFlowSite, setAnalysisFlowSite ] = useState< string | null >( null );

	const handleSiteSelected = ( url: string ) => {
		setIsSiteSelectOpen( false );
		setAnalysisFlowSite( url );
	};

	let title: string;
	let content: ReactNode;
	switch ( selectedTab ) {
		case 'overview':
			title = __( 'Overview' );
			content = <AmplifyOverviewContent />;
			break;
		case 'reports':
			title = __( 'Reports' );
			content = <AmplifyReportsContent />;
			break;
	}

	const isReports = selectedTab === 'reports';

	return (
		<Layout
			title={ title }
			wide
			className={ clsx( { 'full-width-layout-with-table': isReports } ) }
		>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ () => setIsSiteSelectOpen( true ) }
						>
							{ __( 'Amplify a site' ) }
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>{ content }</LayoutBody>

			{ isSiteSelectOpen && (
				<AmplifyAddSiteModal
					onClose={ () => setIsSiteSelectOpen( false ) }
					onSiteSelected={ handleSiteSelected }
				/>
			) }

			<AmplifyAnalysisModal
				site={ analysisFlowSite }
				onClose={ () => setAnalysisFlowSite( null ) }
			/>
		</Layout>
	);
}
