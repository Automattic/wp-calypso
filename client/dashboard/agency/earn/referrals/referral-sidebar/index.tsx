import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { category, people, receipt } from '@wordpress/icons';
import { SidebarBackButton, SidebarMenu, SidebarMenuItem } from '../../../../components/sidebar';
import { useReferral } from '../hooks/use-referral';
import ReferralSwitcherItem from './referral-switcher-item';

export default function ReferralSidebar() {
	const { referral, agencyId } = useReferral();
	const referralId = referral ? String( referral.id ) : '';

	return (
		<VStack spacing={ 2 }>
			<SidebarBackButton to="/referrals">{ __( 'Back to Referrals' ) }</SidebarBackButton>
			{ referral && (
				<VStack spacing={ 4 }>
					<SidebarMenu>
						<ReferralSwitcherItem referral={ referral } agencyId={ agencyId } />
					</SidebarMenu>
					<SidebarMenu>
						<SidebarMenuItem
							icon={ category }
							to={ `/referrals/${ referralId }` }
							activeOptions={ { exact: true } }
						>
							{ __( 'Overview' ) }
						</SidebarMenuItem>
						<SidebarMenuItem icon={ people } to={ `/referrals/${ referralId }/orders` }>
							{ __( 'Referrals' ) }
						</SidebarMenuItem>
						<SidebarMenuItem icon={ receipt } to={ `/referrals/${ referralId }/purchases` }>
							{ __( 'Purchases' ) }
						</SidebarMenuItem>
					</SidebarMenu>
				</VStack>
			) }
		</VStack>
	);
}
