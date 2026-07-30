import { tipaltiPayeeQuery } from '@automattic/api-queries';
import { formatNumber } from '@automattic/number-formatters';
import { Badge } from '@automattic/ui';
import { useQuery } from '@tanstack/react-query';
import { __experimentalHStack as HStack, ExternalLink, Icon } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { reusableBlock } from '@wordpress/icons';
import EmptyState from '../../../components/empty-state';
import InlineSupportLink from '../../../components/inline-support-link';
import RouterLinkButton from '../../../components/router-link-button';
import { getAccountStatus } from '../payout-settings/get-account-status';
import tipaltiLogo from './lib/tipalti-logo';

const AGENCY_EARNINGS_LEARN_MORE_LINK =
	'https://agencieshelp.automattic.com/knowledge-base/automattic-for-agencies-earnings/';

export default function ReferralsEmptyState( { agencyId }: { agencyId: number } ) {
	const { data: payee } = useQuery( tipaltiPayeeQuery( agencyId ) );
	const accountStatus = getAccountStatus( payee );
	const hasPayeeAccount = !! accountStatus?.status;

	return (
		<EmptyState.Wrapper>
			<EmptyState>
				<EmptyState.Header>
					<EmptyState.Title>
						{ sprintf(
							/* translators: %s is a commission percentage, e.g. 50% */
							__( 'Recommend our products. Earn up to a %s commission.' ),
							formatNumber( 0.5, { numberFormatOptions: { style: 'percent' } } )
						) }
					</EmptyState.Title>
					<EmptyState.Description>
						{ createInterpolateElement(
							__(
								'Make money when your clients buy Automattic products, hosting, or use WooPayments. No promo codes needed. <a>How much money will I make?</a>'
							),
							{
								a: (
									<InlineSupportLink
										supportLink={ AGENCY_EARNINGS_LEARN_MORE_LINK }
										forceOpenInHelpCenter
									/>
								),
							}
						) }
					</EmptyState.Description>
				</EmptyState.Header>
				<EmptyState.Content>
					<EmptyState.ActionList>
						<EmptyState.ActionItem
							title={ __( 'Refer products and hosting' ) }
							description={ sprintf(
								/* translators: %s is a commission percentage, e.g. 50% */
								__( 'Receive up to a %s commission.' ),
								formatNumber( 0.5, { numberFormatOptions: { style: 'percent' } } )
							) }
							decoration={ <Icon icon={ reusableBlock } size={ 24 } /> }
							actions={
								<RouterLinkButton
									variant={ hasPayeeAccount ? 'primary' : 'secondary' }
									size="compact"
									__next40pxDefaultSize
									to="/marketplace/exclusive-offers"
								>
									{ __( 'Get started' ) }
								</RouterLinkButton>
							}
						/>
						<EmptyState.ActionItem
							title={
								<HStack as="span" spacing={ 2 } justify="flex-start" expanded={ false }>
									<span>{ __( 'Prepare to get paid' ) }</span>
									{ accountStatus && (
										<Badge intent={ accountStatus.statusType }>{ accountStatus.status }</Badge>
									) }
								</HStack>
							}
							description={ createInterpolateElement(
								__( 'With <a>Tipalti</a>, our secure platform.' ),
								{ a: <ExternalLink href="https://tipalti.com/" children={ null } /> }
							) }
							decoration={
								<span style={ { display: 'flex', alignItems: 'center', height: 24 } }>
									{ tipaltiLogo }
								</span>
							}
							actions={
								<RouterLinkButton
									variant={ hasPayeeAccount ? 'secondary' : 'primary' }
									size="compact"
									__next40pxDefaultSize
									to="/earn/payout-settings"
								>
									{ hasPayeeAccount ? __( 'Edit my details' ) : __( 'Add my details' ) }
								</RouterLinkButton>
							}
						/>
					</EmptyState.ActionList>
				</EmptyState.Content>
			</EmptyState>
		</EmptyState.Wrapper>
	);
}
