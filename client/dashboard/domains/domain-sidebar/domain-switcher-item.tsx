import { __experimentalHStack as HStack, Button, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronUpDown, globe } from '@wordpress/icons';
import { SidebarMenuSwitcherItem } from '../../components/sidebar';
import { Text } from '../../components/text';
import DomainSwitcher from '../domain-switcher';
import type { Domain } from '@automattic/api-core';

export default function DomainSwitcherItem( { domain }: { domain: Domain } ) {
	return (
		<SidebarMenuSwitcherItem
			switcher={
				<DomainSwitcher
					domain={ domain }
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
							label={ __( 'Switch domain' ) }
							icon={ chevronUpDown }
							size="small"
						/>
					) }
				/>
			}
		>
			<HStack justify="flex-start" alignment="center">
				<Icon className="domain-icon" icon={ globe } size={ 24 } />
				<Text weight={ 500 } truncate numberOfLines={ 1 }>
					{ domain.domain }
				</Text>
			</HStack>
		</SidebarMenuSwitcherItem>
	);
}
