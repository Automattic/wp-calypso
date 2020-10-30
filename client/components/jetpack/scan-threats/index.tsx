/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import { numberFormat, translate } from 'i18n-calypso';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import { isEnabled } from 'calypso/config';
import FixAllThreatsDialog from 'calypso/components/jetpack/fix-all-threats-dialog';
import SecurityIcon from 'calypso/components/jetpack/security-icon';
import ThreatDialog from 'calypso/components/jetpack/threat-dialog';
import ThreatItem from 'calypso/components/jetpack/threat-item';
import { FixableThreat, Threat, ThreatAction } from 'calypso/components/jetpack/threat-item/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import contactSupportUrl from 'calypso/lib/jetpack/contact-support-url';
import { useThreats } from 'calypso/lib/jetpack/use-threats';
import { triggerScanRun } from 'calypso/lib/jetpack/trigger-scan-run';

/**
 * Style dependencies
 */
import './style.scss';

interface Site {
	ID: number;
	name: string;
	URL: string;
}

interface Props {
	site: Site;
	threats: Array< Threat >;
	error: boolean;
}

const ScanError: React.FC< { site: Site } > = ( { site } ) => {
	const dispatch = useDispatch();
	const dispatchScanRun = React.useCallback( () => {
		triggerScanRun( site.ID )( dispatch );
	}, [ dispatch, site ] );

	return (
		<div className="scan-threats__error">
			{ isEnabled( 'jetpack/on-demand-scan' )
				? translate(
						'The scanner was unable to check all files and errored before completion. Deal with the threats found above and run the {{runScan}}scan again{{/runScan}}. If the error persists, we are {{linkToSupport}}here to help{{/linkToSupport}}.',
						{
							components: {
								runScan: (
									<Button className="scan-threats__run-scan-button" onClick={ dispatchScanRun } />
								),
								linkToSupport: (
									<a
										href={ contactSupportUrl( site.URL ) }
										rel="noopener noreferrer"
										target="_blank"
									/>
								),
							},
						}
				  )
				: translate(
						'The scanner was unable to check all files and errored before completion. Deal with the threats found above and if the error persists, we are {{linkToSupport}}here to help{{/linkToSupport}}.',
						{
							components: {
								linkToSupport: (
									<a
										href={ contactSupportUrl( site.URL ) }
										rel="noopener noreferrer"
										target="_blank"
									/>
								),
							},
						}
				  ) }
		</div>
	);
};

const ScanThreats = ( { error, site, threats }: Props ) => {
	const {
		updatingThreats,
		selectedThreat,
		setSelectedThreat,
		fixThreats,
		updateThreat,
	} = useThreats( site.ID );
	const [ showThreatDialog, setShowThreatDialog ] = React.useState( false );
	const [ showFixAllThreatsDialog, setShowFixAllThreatsDialog ] = React.useState( false );
	const [ actionToPerform, setActionToPerform ] = React.useState< ThreatAction >( 'fix' );
	const dispatch = useDispatch();
	const dispatchScanRun = React.useCallback( () => {
		triggerScanRun( site.ID )( dispatch );
	}, [ dispatch, site ] );

	const allFixableThreats = threats.filter(
		( threat ): threat is FixableThreat =>
			threat.fixable !== false && threat.fixerStatus !== 'in_progress'
	);
	const hasFixableThreats = !! allFixableThreats.length;

	const openFixAllThreatsDialog = React.useCallback( () => {
		dispatch(
			recordTracksEvent( `calypso_jetpack_scan_allthreats_open`, {
				site_id: site.ID,
			} )
		);
		setShowFixAllThreatsDialog( true );
	}, [ dispatch, site ] );

	const openDialog = React.useCallback(
		( action: ThreatAction, threat: Threat ) => {
			const eventName =
				action === 'fix'
					? 'calypso_jetpack_scan_fixthreat_dialogopen'
					: 'calypso_jetpack_scan_ignorethreat_dialogopen';
			dispatch(
				recordTracksEvent( eventName, {
					site_id: site.ID,
					threat_signature: threat.signature,
				} )
			);
			setSelectedThreat( threat );
			setActionToPerform( action );
			setShowThreatDialog( true );
		},
		[ dispatch, setSelectedThreat, site ]
	);

	const closeDialog = React.useCallback( () => {
		setShowThreatDialog( false );
	}, [] );

	const confirmAction = React.useCallback( () => {
		closeDialog();
		updateThreat( actionToPerform );
	}, [ actionToPerform, closeDialog, updateThreat ] );

	const confirmFixAllThreats = React.useCallback( () => {
		setShowFixAllThreatsDialog( false );
		fixThreats( allFixableThreats );
	}, [ allFixableThreats, fixThreats ] );

	const isFixing = React.useCallback(
		( threat: Threat ) => {
			return (
				!! updatingThreats.find( ( threatId ) => threatId === threat.id ) ||
				threat.fixerStatus === 'in_progress'
			);
		},
		[ updatingThreats ]
	);

	return (
		<>
			<SecurityIcon icon="error" />
			<h1 className="scan-threats scan__header">{ translate( 'Your site may be at risk' ) }</h1>
			<p>
				{ translate(
					'The scan found {{strong}}%(threatCount)s{{/strong}} potential threat with {{strong}}%(siteName)s{{/strong}}.',
					'The scan found {{strong}}%(threatCount)s{{/strong}} potential threats with {{strong}}%(siteName)s{{/strong}}.',
					{
						args: {
							siteName: site.name,
							threatCount: numberFormat( threats.length, 0 ),
						},
						components: { strong: <strong /> },
						comment:
							'%(threatCount)s represents the number of threats currently identified on the site, and $(siteName)s is the name of the site.',
						count: threats.length,
					}
				) }
				<br />
				{ translate(
					'Please review them below and take action. If you have any questions, we are {{a}}here to help{{/a}}.',
					{
						components: {
							a: (
								<a
									href={ contactSupportUrl( site.URL ) }
									rel="noopener noreferrer"
									target="_blank"
								/>
							),
						},
						comment: 'The {{a}} tag is a link that goes to a contact support page.',
					}
				) }
			</p>
			<div className="scan-threats__threats">
				<div className="scan-threats__buttons">
					{ hasFixableThreats && (
						<Button
							primary
							className="scan-threats__fix-all-threats-button"
							onClick={ openFixAllThreatsDialog }
							disabled={ ! hasFixableThreats || updatingThreats.length > 0 }
						>
							{ translate( 'Fix all' ) }
						</Button>
					) }
				</div>
				{ threats.map( ( threat ) => (
					<ThreatItem
						key={ threat.id }
						threat={ threat }
						onFixThreat={ () => openDialog( 'fix', threat ) }
						onIgnoreThreat={ () => openDialog( 'ignore', threat ) }
						isFixing={ isFixing( threat ) }
						contactSupportUrl={ contactSupportUrl( site.URL ) }
						isPlaceholder={ false }
					/>
				) ) }
			</div>

			{ ! error && (
				<div className="scan-threats__rerun">
					{ translate(
						'If you have manually fixed any of the threats listed above, you can {{button}}run a manual scan now{{/button}} or wait for Jetpack to scan your site later today.',
						{
							components: {
								button: (
									<Button className="scan-threats__run-scan-button" onClick={ dispatchScanRun } />
								),
							},
						}
					) }
				</div>
			) }

			{ error && <ScanError site={ site } /> }

			{ selectedThreat && (
				<ThreatDialog
					showDialog={ showThreatDialog }
					onCloseDialog={ closeDialog }
					onConfirmation={ confirmAction }
					siteName={ site.name }
					threat={ selectedThreat }
					action={ actionToPerform }
				/>
			) }
			<FixAllThreatsDialog
				threats={ allFixableThreats }
				showDialog={ showFixAllThreatsDialog }
				onCloseDialog={ () => setShowFixAllThreatsDialog( false ) }
				onConfirmation={ confirmFixAllThreats }
			/>
		</>
	);
};

export default ScanThreats;
