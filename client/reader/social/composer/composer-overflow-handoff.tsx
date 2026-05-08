import './composer-overflow-handoff.scss';

import { sitesQuery, userSettingsQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { DataForm, type Field } from '@wordpress/dataviews';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import PreferencesLoginSiteDropdown from 'calypso/dashboard/me/preferences-primary-site/site-dropdown';
import { errorNotice } from 'calypso/state/notices/actions';
import { useComposerConfig } from './composer-config';
import { useComposer } from './composer-provider';
import { saveDraftMutation } from './use-save-draft-mutation';
import type { Site } from '@automattic/api-core';

interface ComposerOverflowHandoffProps {
	text: string;
}

interface OverflowFormData {
	selectedSiteId: number;
}

type SaveDraftMutate = ReturnType<
	typeof useMutation<
		{ ID: number; site_ID: number; URL: string },
		Error,
		{ siteId: number; content: string }
	>
>[ 'mutate' ];

function SingleSiteHandoff( { site, text }: { site: Site; text: string } ) {
	const translate = useTranslate();
	const { mutate, isPending } = useMutation( saveDraftMutation() );
	return (
		<>
			<p>
				{ translate( 'Publish on %(siteName)s', {
					args: { siteName: site.name },
				} ) }
			</p>
			<MoveToEditorButton site={ site } text={ text } mutate={ mutate } isPending={ isPending } />
		</>
	);
}

function MultiSiteHandoffForm( { sites, text }: { sites: Site[]; text: string } ) {
	const { data: userSettings } = useQuery( userSettingsQuery() );

	const [ userSelection, setUserSelection ] = useState< number | null >( null );

	const displayedSiteId =
		userSelection ??
		( userSettings?.primary_site_ID && sites.some( ( s ) => s.ID === userSettings.primary_site_ID )
			? userSettings.primary_site_ID
			: sites[ 0 ].ID );

	const selectedSite = sites.find( ( s ) => s.ID === displayedSiteId ) ?? sites[ 0 ];

	const { mutate, isPending } = useMutation( saveDraftMutation() );

	const fields = useMemo< Field< OverflowFormData >[] >(
		() => [
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
		],
		[ sites ]
	);

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'selectedSiteId' ],
	};

	const formData: OverflowFormData = { selectedSiteId: displayedSiteId };

	return (
		<>
			<fieldset disabled={ isPending }>
				<DataForm< OverflowFormData >
					data={ formData }
					fields={ fields }
					form={ form }
					onChange={ ( edits ) => {
						if ( edits.selectedSiteId !== undefined ) {
							setUserSelection( edits.selectedSiteId );
						}
					} }
				/>
			</fieldset>
			<MoveToEditorButton
				site={ selectedSite }
				text={ text }
				mutate={ mutate }
				isPending={ isPending }
			/>
		</>
	);
}

function MoveToEditorButton( {
	site,
	text,
	mutate,
	isPending,
}: {
	site: Site;
	text: string;
	mutate: SaveDraftMutate;
	isPending: boolean;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const handleClick = () => {
		mutate(
			{ siteId: site.ID, content: text },
			{
				onSuccess: ( data ) => {
					const adminUrl = site.options?.admin_url;
					if ( ! adminUrl ) {
						dispatch(
							errorNotice( translate( "Couldn't open the editor. Try a different site." ) )
						);
						return;
					}
					window.location.assign(
						addQueryArgs( `${ adminUrl }post.php`, {
							post: data.ID,
							action: 'edit',
						} )
					);
				},
				onError: () => {
					dispatch(
						errorNotice(
							translate( "Couldn't save your draft. Try again or pick a different site." )
						)
					);
				},
			}
		);
	};

	return (
		<Button
			variant="primary"
			__next40pxDefaultSize
			onClick={ handleClick }
			isBusy={ isPending }
			disabled={ isPending }
		>
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
				<MultiSiteHandoffForm sites={ sites } text={ text } />
			) }
		</section>
	);
}
