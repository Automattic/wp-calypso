import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import wooPaymentsLogo from 'calypso/assets/images/a8c-for-agencies/woopayments/logo.svg';
import { useAnalytics } from '../../../app/analytics';
import { ActionList } from '../../../components/action-list';
import EmptyState from '../../../components/empty-state';
import AddWooPaymentsToSite from './add-woopayments-to-site';

import './empty-state.scss';

const WOOPAYMENTS_LEARN_MORE_LINK =
	'https://agencieshelp.automattic.com/knowledge-base/earn-revenue-share-when-clients-use-woopayments/';

const EXCLUDED_SITE_IDS: number[] = [];

export default function WooPaymentsDashboardEmptyState() {
	const { recordTracksEvent } = useAnalytics();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;

	return (
		<EmptyState.Wrapper>
			<EmptyState>
				<img
					className="woopayments-dashboard-empty-state__logo"
					src={ wooPaymentsLogo }
					alt="WooPayments"
				/>
				<EmptyState.Header>
					<EmptyState.Title>
						{ __( 'Earn Revenue Share when clients use WooPayments' ) }
					</EmptyState.Title>
				</EmptyState.Header>
				<EmptyState.Content>
					<ActionList
						description={ __(
							'When new clients sign up to use the WooPayments gateway on WooCommerce stores that you build or manage for them, you will receive a revenue share of 5 basis points on the Total Payments Volume (“TPV”).'
						) }
					>
						<EmptyState.ActionItem
							title={ __( 'Add WooPayments to a site for free' ) }
							description={ __( 'Start by picking the site.' ) }
							actions={
								<AddWooPaymentsToSite
									agencyId={ agencyId }
									excludedSiteIds={ EXCLUDED_SITE_IDS }
									recordTracksEvent={ recordTracksEvent }
									navigate={ ( url ) => {
										window.location.href = url;
									} }
								/>
							}
						/>
						<EmptyState.ActionItem
							title={ __( 'Learn more about the program' ) }
							description={ __( 'Check out the full details in the Knowledge Base.' ) }
							actions={
								<Button
									variant="secondary"
									size="compact"
									href={ WOOPAYMENTS_LEARN_MORE_LINK }
									target="_blank"
									onClick={ () =>
										recordTracksEvent( 'calypso_a4a_woopayments_learn_more_about_program_click' )
									}
								>
									{ __( 'Learn more' ) }
								</Button>
							}
						/>
					</ActionList>
				</EmptyState.Content>
			</EmptyState>
		</EmptyState.Wrapper>
	);
}
