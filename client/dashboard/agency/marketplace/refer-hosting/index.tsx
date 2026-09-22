import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { ButtonStack } from '../../../components/button-stack';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import RouterLinkButton from '../../../components/router-link-button';
import AgencyApprovalNotice from '../agency-approval-notice';
import { getMarketplaceHostingSectionRoute } from '../paths';
import { getReferralConfig } from './config';
import ReferHostingForm from './form';
import type { ReferHostingType } from './types';

export default function ReferHosting( { type }: { type: ReferHostingType } ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const [ isSubmitted, setIsSubmitted ] = useState( false );
	const config = getReferralConfig( type );

	if ( isSubmitted ) {
		return (
			<PageLayout
				size="small"
				header={
					<PageHeader
						prefix={ <Breadcrumbs length={ 2 } /> }
						title={ config.successTitle }
						description={ __(
							'We value your partnership—thank you for helping us identify great opportunities! Once you submit your referral, our team will move quickly to review it and support you. We’ll keep you updated at each step, so you always know what’s happening and can stay connected as the opportunity progresses.'
						) }
					/>
				}
			>
				<ButtonStack justify="flex-start">
					<RouterLinkButton
						variant="primary"
						__next40pxDefaultSize
						to={ getMarketplaceHostingSectionRoute( 'pressable' ) }
						onClick={ () => recordTracksEvent( config.events.backToMarketplace ) }
					>
						{ __( 'Back to the marketplace' ) }
					</RouterLinkButton>
				</ButtonStack>
			</PageLayout>
		);
	}

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ config.formTitle }
					description={ __(
						'Use this form to refer a client. Please fill in your client’s details below — not your own agency’s information. Once submitted, our team will follow up with you directly. All fields are required unless marked as optional.'
					) }
				/>
			}
			notices={ <AgencyApprovalNotice agency={ agency } /> }
		>
			{ agency && (
				<ReferHostingForm
					agencyId={ agency.id }
					config={ config }
					onSubmitted={ () => setIsSubmitted( true ) }
				/>
			) }
		</PageLayout>
	);
}
