import { staticSiteImportSessionQuery } from '@automattic/api-queries';
import { Step } from '@automattic/onboarding';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { _n, sprintf } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import Notice from 'calypso/dashboard/components/notice';
import { ImportCard, SourceCard } from '../components/static-site-import';
import type { Step as StepType } from '../../types';

export type StaticSiteImportResultsSubmits = { action: 'continue' | 'restart' };

const StaticSiteImportResults: StepType< { submits: StaticSiteImportResultsSubmits } > =
	function StaticSiteImportResults( { navigation } ) {
		const { __ } = useI18n();
		const [ searchParams ] = useSearchParams();
		const sessionId = searchParams.get( 'importSessionId' ) ?? '';
		const {
			data: session,
			isPending,
			error,
		} = useQuery( {
			...staticSiteImportSessionQuery( sessionId ),
			enabled: Boolean( sessionId ),
		} );

		const hasPreview = session?.state === 'preview_ready';
		const needsRestart = ! sessionId || Boolean( error ) || ( Boolean( session ) && ! hasPreview );

		const summary = Array.isArray( session?.preview_summary )
			? undefined
			: session?.preview_summary;
		const pages = summary?.pages;
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
					columnWidth={ 8 }
					topBar={ <Step.TopBar /> }
					heading={
						<Step.Heading
							text={ __( 'Your site is ready to move' ) }
							subText={ __( 'Here’s what we found. Nothing moves until you say so.' ) }
						/>
					}
				>
					<VStack spacing={ 8 }>
						<SourceCard />
						<ImportCard title={ __( 'What we found' ) }>
							<VStack spacing={ 4 }>
								<Heading level={ 3 } size={ 16 } weight={ 600 }>
									{ __( 'Comes across' ) }
								</Heading>
								{ rows.map( ( row, index ) => (
									<HStack key={ index } justify="flex-start" spacing={ 4 }>
										<Icon icon={ check } size={ 24 } fill="var( --studio-green-50 )" />
										<span>{ row }</span>
									</HStack>
								) ) }
							</VStack>
							{ hasPreview && summary?.quality_pass !== false && (
								<Notice variant="success">
									{ __(
										'Your site is built from standard pages, posts, and images, so we can rebuild all of it.'
									) }
								</Notice>
							) }
							{ needsRestart && (
								<Notice variant="error">
									{ __(
										'It’s been a while since we read your site, so we need to take a fresh look before moving it.'
									) }
								</Notice>
							) }
							<div>
								{ needsRestart ? (
									<Button
										__next40pxDefaultSize
										variant="primary"
										onClick={ () => navigation.submit?.( { action: 'restart' } ) }
									>
										{ __( 'Read my site again' ) }
									</Button>
								) : (
									<Button
										__next40pxDefaultSize
										variant="primary"
										isBusy={ isPending }
										disabled={ ! hasPreview }
										onClick={ () => navigation.submit?.( { action: 'continue' } ) }
									>
										{ __( 'Continue' ) }
									</Button>
								) }
							</div>
						</ImportCard>
					</VStack>
				</Step.CenteredColumnLayout>
			</>
		);
	};

export default StaticSiteImportResults;
