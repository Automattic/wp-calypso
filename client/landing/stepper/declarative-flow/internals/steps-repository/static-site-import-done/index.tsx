import { staticSiteImportSessionQuery } from '@automattic/api-queries';
import { HelpCenter } from '@automattic/data-stores';
import { Step } from '@automattic/onboarding';
import { useQuery } from '@tanstack/react-query';
import { Button, TextareaControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';
import { Icon, external, lock } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	StatusNotice,
	useStaticSiteImportSource,
	useStaticSiteImportTicket,
} from '../components/static-site-import';
import type { Step as StepType } from '../../types';

import '../components/static-site-import/style.scss';
import './style.scss';

const HELP_CENTER_STORE = HelpCenter.register();

export type StaticSiteImportDoneSubmits = {
	action: 'reported' | 'connect-domain' | 'go-to-site';
};

const getHostname = ( url?: string ) => {
	try {
		return url ? new URL( url ).hostname : '';
	} catch {
		return '';
	}
};

const StaticSiteImportDone: StepType< { submits: StaticSiteImportDoneSubmits } > =
	function StaticSiteImportDone( { navigation } ) {
		const { __ } = useI18n();
		const [ searchParams ] = useSearchParams();
		const sessionId = searchParams.get( 'importSessionId' ) ?? '';
		const keepsDomain = searchParams.get( 'domainChoice' ) === 'keep';
		const { host } = useStaticSiteImportSource();
		const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );
		const { sendTicket, isPending, isError } = useStaticSiteImportTicket();
		const [ feedback, setFeedback ] = useState< 'right' | 'off' | null >( null );
		const [ details, setDetails ] = useState( '' );

		const { data: session } = useQuery( {
			...staticSiteImportSessionQuery( sessionId ),
			enabled: Boolean( sessionId ),
		} );
		const siteUrl = session?.site_url ?? '';

		const onFeedback = ( value: 'right' | 'off' ) => {
			setFeedback( value );
			recordTracksEvent( 'calypso_static_site_import_feedback', { feedback: value } );
		};

		const onGetHelp = async () => {
			try {
				await sendTicket( `Static site import: something’s off. ${ details.trim() }` );
				navigation.submit?.( { action: 'reported' } );
			} catch {
				// The error notice below covers it.
			}
		};

		const previewLink = ( label: string, className: string, variant: 'primary' | 'secondary' ) => (
			<Button
				__next40pxDefaultSize
				className={ className }
				variant={ variant }
				href={ siteUrl }
				target="_blank"
				rel="noopener noreferrer"
				disabled={ ! siteUrl }
				icon={ external }
				iconPosition="right"
			>
				{ label }
			</Button>
		);

		return (
			<>
				<DocumentHead title={ __( 'Your site is ready' ) } />
				<Step.CenteredColumnLayout
					className="step-container-v2--static-site-import-done"
					columnWidth={ 8 }
					topBar={ <Step.TopBar /> }
					heading={
						<Step.Heading
							text={ __( 'Your site is ready' ) }
							subText={
								keepsDomain && host
									? sprintf(
											/* translators: %s: the site's domain, e.g. example.com. */
											__( 'Have a look around. It stays private until you switch %s over to it.' ),
											host
									  )
									: __( 'Have a look around. It stays private until you launch it.' )
							}
						/>
					}
				>
					<div className="static-site-import__panel">
						{ host && (
							<StatusNotice status="success">
								{ sprintf(
									/* translators: %s: the site's domain, e.g. example.com. */
									__( '%s has been rebuilt on WordPress.com.' ),
									host
								) }
							</StatusNotice>
						) }

						<div className="static-site-import-done__frame">
							<div className="static-site-import-done__frame-bar">
								<Icon icon={ lock } size={ 18 } />
								<span className="static-site-import-done__frame-url">
									{ getHostname( siteUrl ) }
								</span>
								<span>{ __( 'Private' ) }</span>
							</div>
							<div className="static-site-import-done__frame-body">
								<span className="static-site-import-done__frame-site">{ host }</span>
								{ previewLink(
									__( 'Open preview' ),
									'static-site-import-done__frame-button',
									'secondary'
								) }
							</div>
						</div>

						<div className="static-site-import__actions">
							{ previewLink( __( 'Preview your new site' ), '', 'secondary' ) }
							<span className="static-site-import__muted">
								{ __( 'Opens in a new tab. Only you can see it.' ) }
							</span>
						</div>

						<div className="static-site-import-done__feedback">
							<span className="static-site-import-done__feedback-question">
								{ __( 'Does it look right?' ) }
							</span>
							<div className="static-site-import__actions">
								<Button
									__next40pxDefaultSize
									variant="secondary"
									isPressed={ feedback === 'right' }
									onClick={ () => onFeedback( 'right' ) }
								>
									{ __( 'Looks right' ) }
								</Button>
								<Button
									__next40pxDefaultSize
									variant="secondary"
									isPressed={ feedback === 'off' }
									onClick={ () => onFeedback( 'off' ) }
								>
									{ __( 'Something’s off' ) }
								</Button>
							</div>
						</div>

						{ feedback === 'off' && (
							<div className="static-site-import-done__report">
								<TextareaControl
									__nextHasNoMarginBottom
									label={ __( 'What doesn’t look right?' ) }
									value={ details }
									onChange={ setDetails }
									rows={ 3 }
								/>
								{ isError && (
									<StatusNotice status="error">
										{ __( 'We couldn’t send that. Please try again.' ) }
									</StatusNotice>
								) }
								<div>
									<Button
										__next40pxDefaultSize
										variant="secondary"
										isBusy={ isPending }
										disabled={ ! details.trim() || isPending }
										onClick={ onGetHelp }
									>
										{ __( 'Get help with this' ) }
									</Button>
								</div>
							</div>
						) }

						<div className="static-site-import__actions">
							<Button
								__next40pxDefaultSize
								variant="primary"
								onClick={ () =>
									navigation.submit?.( {
										action: keepsDomain && host ? 'connect-domain' : 'go-to-site',
									} )
								}
							>
								{ keepsDomain && host
									? sprintf(
											/* translators: %s: the site's domain, e.g. example.com. */
											__( 'Connect %s' ),
											host
									  )
									: __( 'Go to my site' ) }
							</Button>
							<Button variant="link" onClick={ () => setShowHelpCenter( true ) }>
								{ __( 'Need a hand? Get help' ) }
							</Button>
						</div>
					</div>
				</Step.CenteredColumnLayout>
			</>
		);
	};

export default StaticSiteImportDone;
