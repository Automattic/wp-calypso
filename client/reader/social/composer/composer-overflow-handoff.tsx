import './composer-overflow-handoff.scss';

import { sitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useComposerConfig } from './composer-config';
import { useComposer } from './composer-provider';
import type { Site } from '@automattic/api-core';

interface ComposerOverflowHandoffProps {
	text: string;
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
	// Implemented in task 8.
	const translate = useTranslate();
	return (
		<>
			<p>{ translate( 'Pick a site:' ) }</p>
			<MoveToEditorButton site={ sites[ 0 ] } text={ text } />
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
