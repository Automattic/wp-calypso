import { useFuzzySearch } from '@automattic/search';
import {
	Button,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	SearchControl,
	MenuItem,
	Dropdown,
	MenuGroup,
	NavigableMenu,
	ScrollLock,
	Icon,
	IconType,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { chevronDownSmall } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React, { useDeferredValue, useState } from 'react';
import SiteIcon from 'calypso/dashboard/components/site-icon';
import { getSiteDisplayUrl } from 'calypso/dashboard/utils/site-url';
import type { Site } from '@automattic/api-core';
import './style.scss';

const SiteOption = ( { site, icon }: { site: Site; icon?: IconType } ) => {
	return (
		<HStack justify="flex-start" alignment="left" className="site-option">
			<SiteIcon site={ site } size={ 36 } />
			<VStack spacing={ 0 } justify="flex-start" alignment="left">
				<HStack spacing={ 1 } justify="flex-start" alignment="left" style={ { height: '18px' } }>
					<Text truncate numberOfLines={ 1 } weight={ 500 } className="site-option__name">
						{ site.name }
					</Text>
					{ icon && (
						<Icon
							icon={ icon }
							style={ { fill: 'var(--wp-components-color-foreground)', padding: 0 } }
						/>
					) }
				</HStack>
				<Text variant="muted" truncate numberOfLines={ 1 }>
					{ getSiteDisplayUrl( site ) }
				</Text>
			</VStack>
		</HStack>
	);
};

const SiteMenuItem = React.memo( ( { site, onClick }: { site: Site; onClick: () => void } ) => {
	return (
		<MenuItem
			key={ site.ID }
			style={ { height: 'fit-content', minHeight: '40px' } }
			onClick={ onClick }
			className="site-menu-item"
		>
			<SiteOption site={ site } />
		</MenuItem>
	);
} );

SiteMenuItem.displayName = 'SiteMenuItem';

interface Props {
	onChange: ( site: Site | null ) => void;
	value: Site | null;
	sites: Site[];
}

export const SiteSelector = ( { onChange, value, sites }: Props ) => {
	const translate = useTranslate();
	const [ search, setSearch ] = useState( '' );
	const deferred = useDeferredValue( search );
	const isDesktop = useViewportMatch( 'medium' );

	const filteredSites = useFuzzySearch( {
		data: sites,
		keys: [ 'name', 'URL' ],
		query: deferred,
	} );

	const handleSelectSite = ( selected: Site ) => {
		onChange( selected );
	};

	if ( ! value ) {
		return null;
	}

	return (
		<Dropdown
			renderToggle={ ( { onToggle } ) => (
				<Button
					onClick={ onToggle }
					label={ translate( 'Select a site' ) }
					style={ { height: 'fit-content', padding: '0' } }
				>
					<SiteOption site={ value } icon={ chevronDownSmall } />
				</Button>
			) }
			renderContent={ ( { onClose } ) => (
				<NavigableMenu style={ { maxWidth: isDesktop ? '30vw' : '70vw' } }>
					<ScrollLock />
					<MenuGroup hideSeparator>
						<SearchControl
							__nextHasNoMarginBottom
							placeholder={ translate( 'Search sites' ) }
							onChange={ ( value ) => {
								setSearch( value );
							} }
							value={ search }
						/>
					</MenuGroup>
					<MenuGroup hideSeparator>
						{ filteredSites.map( ( site ) => (
							<SiteMenuItem
								key={ site.ID }
								site={ site }
								onClick={ () => {
									handleSelectSite( site );
									onClose();
								} }
							/>
						) ) }
					</MenuGroup>
				</NavigableMenu>
			) }
		/>
	);
};
