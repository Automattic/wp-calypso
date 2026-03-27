import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronUpDown } from '@wordpress/icons';
import { Suspense, lazy, useMemo } from 'react';
import { useAppContext } from '../../app/context';
import { SidebarMenuSwitcherItem } from '../../components/sidebar';
import SiteIcon from '../../components/site-icon';
import { Text } from '../../components/text';
import { getSiteDisplayName } from '../../utils/site-name';
import { getSiteDisplayUrl } from '../../utils/site-url';
import type { SiteSwitcherProps } from '../../sites/site-switcher/types';
import type { Site } from '@automattic/api-core';

export default function SiteSwitcherItem( { site }: { site: Site } ) {
	const { components } = useAppContext();
	const SiteSwitcher = useMemo(
		() =>
			lazy( components.siteSwitcher ) as React.LazyExoticComponent< React.FC< SiteSwitcherProps > >,
		[ components ]
	);

	return (
		<SidebarMenuSwitcherItem
			switcher={
				<Suspense fallback={ null }>
					<SiteSwitcher
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
				</Suspense>
			}
		>
			<HStack justify="flex-start" alignment="center">
				<SiteIcon site={ site } size={ 36 } />
				<VStack spacing={ 0 }>
					<Text weight={ 500 } truncate numberOfLines={ 1 }>
						{ getSiteDisplayName( site ) }
					</Text>
					<ExternalLink
						href={ site.URL }
						style={ { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }
					>
						{ getSiteDisplayUrl( site ) }
					</ExternalLink>
				</VStack>
			</HStack>
		</SidebarMenuSwitcherItem>
	);
}
