import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronUpDown } from '@wordpress/icons';
import { SidebarMenuSwitcherItem } from '../../../../components/sidebar';
import { Text } from '../../../../components/text';
import ReferralSwitcher from '../referral-switcher';
import type { Referral } from '@automattic/api-core';

export default function ReferralSwitcherItem( {
	referral,
	agencyId,
}: {
	referral: Referral;
	agencyId: number;
} ) {
	return (
		<SidebarMenuSwitcherItem
			switcher={
				<ReferralSwitcher
					referral={ referral }
					agencyId={ agencyId }
					renderToggle={ ( { isOpen, onToggle } ) => (
						<Button
							variant="tertiary"
							onClick={ onToggle }
							onKeyDown={ ( event: React.KeyboardEvent ) => {
								if ( ! isOpen && event.code === 'ArrowDown' ) {
									event.preventDefault();
									onToggle();
								}
							} }
							aria-haspopup="true"
							aria-expanded={ isOpen }
							label={ __( 'Switch referral' ) }
							icon={ chevronUpDown }
							size="small"
						/>
					) }
				/>
			}
		>
			<HStack justify="flex-start" alignment="center">
				<Text weight={ 500 } truncate numberOfLines={ 1 }>
					{ referral.client.email }
				</Text>
			</HStack>
		</SidebarMenuSwitcherItem>
	);
}
