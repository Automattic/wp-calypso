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
	const steps = useMemo(
		() => [
			{ id: 'preparing', label: translate( 'Preparing your site' ) },
			{ id: 'designing', label: translate( 'Choosing your design' ) },
			{ id: 'building', label: translate( 'Building your pages' ) },
			{ id: 'polishing', label: translate( 'Polishing your design' ) },
			{ id: 'finalizing', label: translate( 'Getting everything ready' ) },
		],
		[ translate ]
	);
	const state = useSiteGeneration( { siteIdentifier, editorUrl, steps } );

	const retry = () => {
		window.location.reload();
	};

	return (
		<>
			<DocumentHead title={ translate( 'Generating your site' ) } />
			<SiteGenerationView onRetry={ retry } state={ state } />
		</>
	);
};

export default SiteGeneration;
