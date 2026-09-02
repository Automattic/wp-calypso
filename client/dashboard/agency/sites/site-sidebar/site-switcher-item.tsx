import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronUpDown } from '@wordpress/icons';
import { SidebarMenuSwitcherItem } from '../../../components/sidebar';
import { Text } from '../../../components/text';
import { getDisplayUrl, getSiteName, getSiteUrl } from '../dataviews/site-data';
import AgencySiteIcon from '../site-icon';
import AgencySiteSwitcher from '../site-switcher';
import type { AgencySite } from '@automattic/api-core';

export default function AgencySiteSwitcherItem( { site }: { site: AgencySite } ) {
	return (
		<SidebarMenuSwitcherItem
			switcher={
				<AgencySiteSwitcher
					site={ site }
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
							label={ __( 'Switch site' ) }
							icon={ chevronUpDown }
							size="small"
						/>
					) }
				/>
			}
		>
			<HStack justify="flex-start" alignment="center">
				<AgencySiteIcon site={ site } size={ 36 } />
				<VStack spacing={ 0 }>
					<Text weight={ 500 } truncate numberOfLines={ 1 }>
						{ getSiteName( site ) }
					</Text>
					<ExternalLink
						href={ getSiteUrl( site ) }
						style={ { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }
					>
						{ getDisplayUrl( site ) }
					</ExternalLink>
				</VStack>
			</HStack>
		</SidebarMenuSwitcherItem>
	);
}
