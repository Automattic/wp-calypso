import { staticSiteImportSessionQuery } from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { _n, sprintf } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { Panel, SourceCard, StatusNotice } from '../components/static-site-import';
import type { Step as StepType } from '../../types';
import type { StaticSiteImportPreviewSummary } from '@automattic/api-core';

import '../components/static-site-import/style.scss';
import './style.scss';

const getPageCount = ( summary?: StaticSiteImportPreviewSummary | [] ) =>
	summary && ! Array.isArray( summary ) ? summary.pages : undefined;

const isFullRebuild = ( summary?: StaticSiteImportPreviewSummary | [] ) =>
	!! summary && ! Array.isArray( summary ) && summary.quality_pass !== false;

const StaticSiteImportResults: StepType = function StaticSiteImportResults( { navigation } ) {
	const { __ } = useI18n();
	const [ searchParams ] = useSearchParams();
	const sessionId = searchParams.get( 'importSessionId' ) ?? '';
	const { data: session } = useQuery( {
		...staticSiteImportSessionQuery( sessionId ),
		enabled: Boolean( sessionId ),
	} );

	const pages = getPageCount( session?.preview_summary );
	const strong = { strong: <strong /> };

	const rows = [
		...( pages
			? [
					createInterpolateElement(
						sprintf(
							/* translators: %d: number of pages found on the site. */
							_n( '<strong>%d page</strong> found', '<strong>%d pages</strong> found', pages ),
							pages
						),
						strong
					),
			  ]
			: [] ),
		createInterpolateElement( __( '<strong>Your images</strong> in full quality' ), strong ),
		createInterpolateElement( __( '<strong>Your domain</strong> can come with you' ), strong ),
		createInterpolateElement(
			__( '<strong>Fonts, colors, and layout</strong> carried over' ),
			strong
		),
	];

	return (
		<>
			<DocumentHead title={ __( 'Your site is ready to move' ) } />
			<Step.CenteredColumnLayout
				className="step-container-v2--static-site-import-results"
				columnWidth={ 8 }
				topBar={ <Step.TopBar /> }
				heading={
					<Step.Heading
						text={ __( 'Your site is ready to move' ) }
						subText={ __( 'Here’s what we found. Nothing moves until you say so.' ) }
					/>
				}
			>
				<div className="static-site-import__stack">
					<SourceCard />
					<Panel title={ __( 'What we found' ) }>
						<h3 className="static-site-import-results__subtitle">{ __( 'Comes across' ) }</h3>
						<ul className="static-site-import-results__list">
							{ rows.map( ( row, index ) => (
								<li key={ index }>
									<Icon className="static-site-import-results__check" icon={ check } size={ 24 } />
									<span>{ row }</span>
								</li>
							) ) }
						</ul>
						{ isFullRebuild( session?.preview_summary ) && (
							<StatusNotice status="success">
								{ __(
									'Your site is built from standard pages, posts, and images, so we can rebuild all of it.'
								) }
							</StatusNotice>
						) }
						<Button __next40pxDefaultSize variant="primary" onClick={ () => navigation.submit?.() }>
							{ __( 'Continue' ) }
						</Button>
					</Panel>
				</div>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default StaticSiteImportResults;
