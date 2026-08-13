import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
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
	// Fallback checklist only: the server-computed ui.steps from the status
	// endpoint is authoritative (labels included, already localized). This
	// list covers the moments before the first response arrives, and backends
	// that do not send the ui block yet.
	const steps = useMemo(
		() => [
			{ id: 'preparing', label: translate( 'Preparing your site' ) },
			{ id: 'designing', label: translate( 'Choosing your design' ) },
			{ id: 'building', label: translate( 'Building your pages' ) },
			{ id: 'images', label: translate( 'Adding your images' ) },
			{ id: 'polishing', label: translate( 'Polishing your site' ) },
			{ id: 'publishing', label: translate( 'Publishing your site' ) },
		],
		[ translate ]
	);
	const state = useSiteGeneration( { siteIdentifier, editorUrl, specId, steps } );

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
