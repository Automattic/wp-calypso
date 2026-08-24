import page from '@automattic/calypso-router';
import {
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import wooPaymentsLogo from 'calypso/assets/images/a8c-for-agencies/woopayments/logo.svg';
import AddWooPaymentsToSite from 'calypso/dashboard/agency/earn/woopayments/add-woopayments-to-site';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

// The empty state shows before any site has WooPayments, so nothing is excluded from the picker.
const EXCLUDED_SITE_IDS: number[] = [];

const WooPaymentsDashboardEmptyState = () => {
	const dispatch = useDispatch();
	const agencyId = useSelector( getActiveAgencyId ) ?? 0;
	const { showSupportGuide } = useHelpCenter();

	const recordTracks = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	return (
		<div className="woopayments-dashboard-empty-state__content">
			<img src={ wooPaymentsLogo } alt="WooPayments" />
			<div>
				<div className="woopayments-dashboard-empty-state__heading">
					{ __( 'Earn Revenue Share when clients use WooPayments' ) }
				</div>
				<div className="woopayments-dashboard-empty-state__description">
					{ __(
						'When new clients sign up to use the WooPayments gateway on WooCommerce stores that you build or manage for them, you will receive a revenue share of 5 basis points on the Total Payments Volume (“TPV”).'
					) }
				</div>
			</div>
			<VStack className="woopayments-dashboard-empty-state__step" spacing={ 3 }>
				<Heading level={ 4 }>{ __( 'How do I start?' ) }</Heading>
				<Card>
					<CardBody>
						<HStack justify="space-between">
							<VStack spacing={ 1 }>
								<Text weight={ 600 }>{ __( 'Add WooPayments to a site for free' ) }</Text>
								<Text variant="muted">{ __( 'Start by picking the site' ) }</Text>
							</VStack>
							<AddWooPaymentsToSite
								agencyId={ agencyId }
								excludedSiteIds={ EXCLUDED_SITE_IDS }
								recordTracksEvent={ recordTracks }
								navigate={ ( url ) => page.redirect( url ) }
							/>
						</HStack>
					</CardBody>
				</Card>
			</VStack>
			<VStack
				className="woopayments-dashboard-empty-state__step"
				spacing={ 2 }
				alignment="flex-start"
			>
				<Heading level={ 4 }>{ __( 'Learn more about the program' ) }</Heading>
				<Button
					variant="link"
					onClick={ () => {
						dispatch(
							recordTracksEvent( 'calypso_a4a_woopayments_learn_more_about_program_click' )
						);
						showSupportGuide(
							'https://agencieshelp.automattic.com/knowledge-base/earn-revenue-share-when-clients-use-woopayments/'
						);
					} }
				>
					{ __( 'Check out the full details in the Knowledge Base' ) }
				</Button>
			</VStack>
		</div>
	);
};

export default WooPaymentsDashboardEmptyState;
