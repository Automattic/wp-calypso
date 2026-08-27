import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { getBuildWowGraph } from 'calypso/landing/stepper/utils/build-wow';
import { getSafeEditorUrl } from './editor-url';
import { useSiteGeneration } from './use-site-generation';
import { SiteGenerationView } from './view';
import type { Step as StepType } from '../../types';
import './style.scss';

const SiteGeneration: StepType = function SiteGeneration() {
	const translate = useTranslate();
	const query = useMemo( () => new URLSearchParams( window.location.search ), [] );
	const siteIdentifier = query.get( 'siteId' ) || query.get( 'siteSlug' );
	const editorUrl = getSafeEditorUrl( query.get( 'editorUrl' ) );
	const specId = query.get( 'specId' );
	const graph = getBuildWowGraph( query );
	// Fallback checklist only: the server-computed ui.steps from the status
	// endpoint is authoritative (labels included, already localized). This
	// list covers the moments before the first response arrives, and backends
	// that do not send the ui block yet. Keep these IDs aligned with the server
	// so React preserves each progress row when the first response arrives.
	const steps = useMemo(
		() => [
			{ id: 'prepare', label: translate( 'Preparing your site' ) },
			{ id: 'design', label: translate( 'Choosing your design' ) },
			{ id: 'pages', label: translate( 'Building your pages' ) },
			{ id: 'images', label: translate( 'Adding your images' ) },
			{ id: 'polish', label: translate( 'Polishing your site' ) },
			{ id: 'publish', label: translate( 'Publishing your site' ) },
		],
		[ translate ]
	);
	const state = useSiteGeneration( { siteIdentifier, editorUrl, specId, graph, steps } );

	const reload = () => {
		window.location.reload();
	};

	return (
		<>
			<DocumentHead title={ translate( 'Generating your site' ) } />
			<SiteGenerationView onReload={ reload } state={ state } />
		</>
	);
};

export default SiteGeneration;
