import './composer-overflow-handoff.scss';

import { sitesQuery, userSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { DataForm, type Field } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import PreferencesLoginSiteDropdown from 'calypso/dashboard/me/preferences-primary-site/site-dropdown';
import { useComposerConfig } from './composer-config';
import { useComposer } from './composer-provider';
import type { Site } from '@automattic/api-core';

interface ComposerOverflowHandoffProps {
	text: string;
}

interface OverflowFormData {
	selectedSiteId: number;
}

function SingleSiteHandoff( { site, text }: { site: Site; text: string } ) {
	const translate = useTranslate();
	return (
		<>
			<p>
				{ translate( 'Publish on %(siteName)s', {
					args: { siteName: site.name },
				} ) }
			</p>
			<MoveToEditorButton site={ site } text={ text } />
		</>
	);
}

function MultiSiteHandoff( { sites, text }: { sites: Site[]; text: string } ) {
	const { data: userSettings, isPending } = useQuery( userSettingsQuery() );

	if ( isPending ) {
		return null;
	}

	return (
		<MultiSiteHandoffForm
			sites={ sites }
			text={ text }
			primarySiteId={ userSettings?.primary_site_ID }
		/>
	);
}

function MultiSiteHandoffForm( {
	sites,
	text,
	primarySiteId,
}: {
	sites: Site[];
	text: string;
	primarySiteId?: number;
} ) {
	const defaultSiteId =
		primarySiteId && sites.some( ( s ) => s.ID === primarySiteId ) ? primarySiteId : sites[ 0 ].ID;

	const [ formData, setFormData ] = useState< OverflowFormData >( {
		selectedSiteId: defaultSiteId,
	} );

	const fields: Field< OverflowFormData >[] = [
		{
			id: 'selectedSiteId',
			label: '',
			Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
				const { id, getValue } = field;
				const value = getValue( { item: data } )?.toString( 10 ) ?? '';
				return (
					<PreferencesLoginSiteDropdown
						sites={ sites }
						value={ value }
						onChange={ ( newValue ) => {
							if ( newValue ) {
								onChange( { [ id ]: parseInt( newValue, 10 ) } );
							}
						} }
						label=""
						hideLabelFromVision={ hideLabelFromVision }
					/>
				);
			},
		},
	];

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'selectedSiteId' ],
	};

	const selectedSite = sites.find( ( s ) => s.ID === formData.selectedSiteId ) ?? sites[ 0 ];

	return (
		<>
			<DataForm< OverflowFormData >
				data={ formData }
				fields={ fields }
				form={ form }
				onChange={ ( edits ) => setFormData( ( d ) => ( { ...d, ...edits } ) ) }
			/>
			<MoveToEditorButton site={ selectedSite } text={ text } />
		</>
	);
}

function MoveToEditorButton( { site, text }: { site: Site; text: string } ) {
	const translate = useTranslate();
	// Wired up to the mutation + redirect in task 9.
	void site;
	void text;
	return (
		<Button variant="primary" __next40pxDefaultSize>
			{ translate( 'Move to editor' ) }
		</Button>
	);
}

export function ComposerOverflowHandoff( { text }: ComposerOverflowHandoffProps ) {
	const translate = useTranslate();
	const { hasBeenOverLimit } = useComposer();
	const config = useComposerConfig();

	const { data: sites } = useQuery( {
		...sitesQuery( 'all' ),
		enabled: hasBeenOverLimit,
	} );

	if ( ! hasBeenOverLimit ) {
		return null;
	}

	if ( ! sites || sites.length === 0 ) {
		return null;
	}

	return (
		<section
			className="social-composer__overflow-handoff"
			aria-label={ translate( 'Publish on your own site' ) as string }
		>
			<p>
				{ translate( 'Too long for %(protocol)s? Publish it on your own site instead.', {
					args: { protocol: config.protocolLabel },
				} ) }
			</p>
			{ sites.length === 1 ? (
				<SingleSiteHandoff site={ sites[ 0 ] } text={ text } />
			) : (
				<MultiSiteHandoff sites={ sites } text={ text } />
			) }
		</section>
	);
}
