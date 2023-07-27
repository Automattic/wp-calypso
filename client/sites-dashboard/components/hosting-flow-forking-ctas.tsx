import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { useIsCurrentlyHostingFlow } from 'calypso/landing/stepper/utils/hosting-flow';
import { useAddNewSiteUrl } from 'calypso/lib/paths/use-add-new-site-url';
import { useSitesDashboardImportSiteUrl } from '../hooks/use-sites-dashboard-import-site-url';
import { TRACK_SOURCE_NAME, MEDIA_QUERIES } from '../utils';

interface HostingFlowCTAProps {
	heading?: string;
	description: string;
	label: string;
	target: string;
}

export const HostingFlowCTA = ( { description, label, target }: HostingFlowCTAProps ) => {
	return (
		<div
			css={ {
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				[ MEDIA_QUERIES.small ]: {
					alignItems: 'flex-start',
					flexDirection: 'column',
					gap: '20px',
				},
			} }
		>
			<div
				css={ {
					marginRight: '32px',
				} }
			>
				<span
					css={ {
						textAlign: 'left',
						whiteSpace: 'nowrap',
						color: 'var(--studio-gray-100)',
					} }
				>
					{ description }
				</span>
			</div>
			<Button href={ target } primary>
				{ label }
			</Button>
		</div>
	);
};

export const CreateSiteCTA = () => {
	const { __ } = useI18n();

	const createSiteUrl = useAddNewSiteUrl( {
		source: TRACK_SOURCE_NAME,
		ref: useIsCurrentlyHostingFlow() ? 'hosting-flow' : 'calypso-nosites',
	} );

	return (
		<HostingFlowCTA
			description={ __( 'Build a new site from scratch' ) }
			label={ __( 'Create a site' ) }
			target={ createSiteUrl }
		/>
	);
};

export const MigrateSiteCTA = () => {
	const { __ } = useI18n();
	const importSiteUrl = useSitesDashboardImportSiteUrl( {
		ref: useIsCurrentlyHostingFlow() ? 'hosting-flow' : 'calypso-nosites',
	} );

	return (
		<HostingFlowCTA
			description={ __( 'Bring a site to WordPress.com' ) }
			label={ __( 'Migrate a site' ) }
			target={ importSiteUrl }
		/>
	);
};
