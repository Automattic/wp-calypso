import './composer-overflow-handoff.scss';

import { sitesQuery, userSettingsQuery } from '@automattic/api-queries';
import { useMutation, useQuery, type UseMutationResult } from '@tanstack/react-query';
import { Button, ComboboxControl } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { logToLogstash } from 'calypso/lib/logstash';
import { errorNotice } from 'calypso/state/notices/actions';
import { useComposerConfig } from './composer-config';
import { useComposer } from './composer-provider';
import {
	saveDraftMutation,
	type SaveDraftMutationResult,
	type SaveDraftMutationVariables,
} from './use-save-draft-mutation';
import type { Site } from '@automattic/api-core';

interface ComposerOverflowHandoffProps {
	text: string;
}

type SaveDraftMutate = UseMutationResult<
	SaveDraftMutationResult,
	Error,
	SaveDraftMutationVariables
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
	const translate = useTranslate();
	// Gate the picker render on `userSettings` having settled so the
	// pre-selected value doesn't flip from sites[0] to the primary site
	// once the query resolves (visible flicker if the user types past the
	// limit before the settings query is in cache).
	const { data: userSettings, isPending: settingsPending } = useQuery( userSettingsQuery() );

	const [ userSelection, setUserSelection ] = useState< number | null >( null );

	const initialSiteId =
		userSettings?.primary_site_ID && sites.some( ( s ) => s.ID === userSettings.primary_site_ID )
			? userSettings.primary_site_ID
			: sites[ 0 ].ID;

	const displayedSiteId = userSelection ?? initialSiteId;

	const selectedSite = sites.find( ( s ) => s.ID === displayedSiteId ) ?? sites[ 0 ];

	const { mutate, isPending } = useMutation( saveDraftMutation() );

	const options = useMemo(
		() =>
			sites.map( ( s ) => ( {
				value: String( s.ID ),
				label: s.name || s.URL,
			} ) ),
		[ sites ]
	);

	if ( settingsPending ) {
		return null;
	}

	return (
		<>
			<fieldset disabled={ isPending }>
				<ComboboxControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ translate( 'Choose a site' ) as string }
					value={ String( displayedSiteId ) }
					onChange={ ( newValue ) => {
						if ( newValue ) {
							setUserSelection( parseInt( newValue, 10 ) );
						}
					} }
					options={ options }
					allowReset={ false }
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
					// `admin_url` is documented to be set on every WP.com site
					// returned by /me/sites; falling back to a derived path
					// avoids leaving an orphan draft if the field is missing.
					const adminUrl =
						site.options?.admin_url ?? `${ site.URL.replace( /\/$/, '' ) }/wp-admin/`;
					window.location.assign(
						addQueryArgs( `${ adminUrl }post.php`, {
							post: data.ID,
							action: 'edit',
						} )
					);
				},
				onError: ( error ) => {
					dispatch(
						errorNotice(
							translate( "Couldn't save your draft. Try again or pick a different site." )
						)
					);
					logToLogstash( {
						feature: 'calypso_client',
						message: 'Reader social composer overflow handoff: save draft failed',
						severity: 'error',
						extra: {
							type: 'reader_social_composer_overflow_handoff_save_draft_error',
							site_id: site.ID,
							error_message: error?.message,
						},
					} );
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
