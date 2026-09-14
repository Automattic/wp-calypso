import './site-handoff.scss';

import { userSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	ComboboxControl,
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { SiteIconThumb } from './site-icon-thumb';
import { useHandoffMutation } from './use-handoff-mutation';
import type { HandoffMutationApi, HandoffTracks } from './use-handoff-mutation';
import type { Site } from '@automattic/api-core';

interface SiteHandoffProps {
	sites: Site[];
	content: string;
	buttonLabel: string;
	tracks?: HandoffTracks;
	caller: string;
	onSuccess?: () => void;
}

function getSiteDisplayUrl( site: Site ) {
	return ( site.URL || '' ).replace( /^https?:\/\//, '' ).replace( /\/$/, '' );
}

function SingleSiteBody( {
	site,
	content,
	buttonLabel,
	submit,
	isPending,
}: {
	site: Site;
	content: string;
	buttonLabel: string;
	submit: HandoffMutationApi[ 'submit' ];
	isPending: boolean;
} ) {
	const translate = useTranslate();
	return (
		<>
			<p>
				{ translate( 'Publish on %(siteName)s', {
					args: { siteName: site.name },
				} ) }
			</p>
			<Button
				variant="primary"
				__next40pxDefaultSize
				onClick={ () => submit( { site, content } ) }
				isBusy={ isPending }
				disabled={ isPending }
			>
				{ buttonLabel }
			</Button>
		</>
	);
}

function MultiSiteBody( {
	sites,
	content,
	buttonLabel,
	submit,
	isPending,
}: {
	sites: Site[];
	content: string;
	buttonLabel: string;
	submit: HandoffMutationApi[ 'submit' ];
	isPending: boolean;
} ) {
	const translate = useTranslate();
	const { data: userSettings, isPending: settingsPending } = useQuery( userSettingsQuery() );
	const [ userSelection, setUserSelection ] = useState< number | null >( null );

	const options = useMemo(
		() =>
			sites.map( ( s ) => ( {
				value: String( s.ID ),
				label: s.name || s.URL,
				site: s,
			} ) ),
		[ sites ]
	);

	// Defensive: callers should already gate on a non-empty sites array, but
	// TypeScript can't see through that guarantee. Hooks above run
	// unconditionally; this guard sits below them and above the first
	// `sites[0]` access.
	if ( sites.length === 0 ) {
		return null;
	}

	const initialSiteId =
		userSettings?.primary_site_ID && sites.some( ( s ) => s.ID === userSettings.primary_site_ID )
			? userSettings.primary_site_ID
			: sites[ 0 ].ID;

	const displayedSiteId = userSelection ?? initialSiteId;
	const selectedSite = sites.find( ( s ) => s.ID === displayedSiteId ) ?? sites[ 0 ];

	const renderItem = ( { item }: { item: { value: string; label: string; site?: Site } } ) => {
		const site = item.site ?? sites.find( ( s ) => String( s.ID ) === item.value );
		if ( ! site ) {
			return null;
		}
		const isSelected = item.value === String( displayedSiteId );
		return (
			<HStack
				className="social-site-handoff-option"
				spacing={ 3 }
				alignment="left"
				justify="space-between"
			>
				<HStack spacing={ 3 } alignment="left" justify="left">
					<SiteIconThumb site={ site } />
					<VStack spacing={ 0 }>
						<Text as="div" weight={ 500 } size={ 14 } lineHeight={ 1.5 } color="inherit">
							{ item.label }
						</Text>
						<Text as="div" size={ 12 } weight={ 300 } lineHeight={ 1.2 } color="inherit">
							{ getSiteDisplayUrl( site ) }
						</Text>
					</VStack>
				</HStack>
				{ isSelected && <Icon icon={ check } size={ 24 } className="social-site-handoff-check" /> }
			</HStack>
		);
	};

	// Gate the picker render on the user-settings query having settled so
	// the pre-selected option doesn't flip from sites[0] to the primary site
	// once the query resolves — that flip is visible if the host modal
	// opens before the settings query is in cache.
	if ( settingsPending ) {
		return null;
	}

	return (
		<>
			<fieldset disabled={ isPending } className="social-site-handoff-fieldset">
				<ComboboxControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					className="social-site-handoff-combobox"
					label={ translate( 'Choose a site' ) as string }
					value={ String( displayedSiteId ) }
					onChange={ ( newValue ) => {
						if ( newValue ) {
							setUserSelection( parseInt( newValue, 10 ) );
						}
					} }
					options={ options }
					allowReset={ false }
					__experimentalRenderItem={ renderItem }
				/>
			</fieldset>
			<Button
				variant="primary"
				__next40pxDefaultSize
				onClick={ () => submit( { site: selectedSite, content } ) }
				isBusy={ isPending }
				disabled={ isPending }
			>
				{ buttonLabel }
			</Button>
		</>
	);
}

export function SiteHandoff( props: SiteHandoffProps ) {
	const { sites, content, buttonLabel, tracks, caller, onSuccess } = props;
	const { submit, isPending } = useHandoffMutation( { tracks, caller, onSuccess } );
	const shared = { content, buttonLabel, submit, isPending };
	if ( sites.length === 1 ) {
		return <SingleSiteBody { ...shared } site={ sites[ 0 ] } />;
	}
	return <MultiSiteBody { ...shared } sites={ sites } />;
}
