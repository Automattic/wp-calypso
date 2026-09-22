import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useHelpCenter } from '../../../app/help-center';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import RouterLinkButton from '../../../components/router-link-button';
import { PARTNER_DIRECTORY_EXPERTISE_ROUTE, PARTNER_DIRECTORY_ROUTE } from '../paths';
import PartnerDirectoryDetailsContent, { getDetailsDescription } from './details-content';

export default function AgencyPartnerDirectoryDetails() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { recordTracksEvent } = useAnalytics();
	const navigate = useNavigate();
	const { setShowHelpCenter, setNavigateToRoute } = useHelpCenter();

	const openSupportGuide = ( link: string ) => {
		setShowHelpCenter( true );
		setNavigateToRoute( '/post?link=' + encodeURIComponent( link ) );
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Agency details' ) }
					description={ getDetailsDescription(
						<RouterLinkButton
							variant="link"
							to={ PARTNER_DIRECTORY_EXPERTISE_ROUTE }
							children={ null }
						/>
					) }
				/>
			}
		>
			{ agency && (
				<PartnerDirectoryDetailsContent
					agency={ agency }
					recordTracksEvent={ recordTracksEvent }
					onSubmitSuccess={ () => navigate( { to: PARTNER_DIRECTORY_ROUTE } ) }
					openSupportGuide={ openSupportGuide }
				/>
			) }
		</PageLayout>
	);
}
