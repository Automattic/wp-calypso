import { Button, Card, FoldableCard } from '@automattic/components';
import { numberFormat, translate } from 'i18n-calypso';
import * as React from 'react';
import InfoPopover from 'calypso/components/info-popover';
import FixAllThreatsDialog from 'calypso/components/jetpack/fix-all-threats-dialog';
import SecurityIcon from 'calypso/components/jetpack/security-icon';
import ThreatDialog from 'calypso/components/jetpack/threat-dialog';
import ThreatItem from 'calypso/components/jetpack/threat-item';
import { FixableThreat, Threat, ThreatAction } from 'calypso/components/jetpack/threat-item/types';
import ThreatListHeader from 'calypso/components/jetpack/threat-list-header';
import ThreatLowRiskItemHeader from 'calypso/components/jetpack/threat-low-risk-item-header';
import contactSupportUrl from 'calypso/lib/jetpack/contact-support-url';
import { triggerScanRun } from 'calypso/lib/jetpack/trigger-scan-run';
import { useThreats } from 'calypso/lib/jetpack/use-threats';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

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
			{ translate(
				'The scanner was unable to check all files and errored before completion. Deal with the threats found above and run the {{runScan}}scan again{{/runScan}}. If the error persists, we are {{linkToSupport}}here to help{{/linkToSupport}}.',
				{
					components: {
						runScan: (
							<Button className="scan-threats__run-scan-button" onClick={ dispatchScanRun } />
						),
						linkToSupport: (
							<a href={ contactSupportUrl( site.URL ) } rel="noopener noreferrer" target="_blank" />
						),
					},
				}
			) }
		</div>
	);
};

const getThreatCountMessage = (
	countHighSeverity: number,
	countLowSeverity: number,
	prefix: string | null,
	suffix: string | null
) => {
	let lowThreatsSummary = '';
	if ( countLowSeverity ) {
		lowThreatsSummary = String(
			translate( '%(lowCount)s low risk item', '%(lowCount)s low risk items', {
				args: {
					lowCount: numberFormat( countLowSeverity ),
				},
				comment: '$(lowCount)s is the number of low severity items found.',
				count: countLowSeverity,
			} )
		);
	}

	let highThreatsSummary = '';
	if ( countHighSeverity ) {
		highThreatsSummary = String(
			translate( '%(threatCount)s threat', '%(threatCount)s threats', {
				args: {
					threatCount: numberFormat( countHighSeverity ),
				},
				comment: '%(threatCount)s represents the number of higher severity threats found.',
				count: countHighSeverity,
			} )
		);
	}

	let headerSummary = '';
	if ( highThreatsSummary && lowThreatsSummary ) {
		headerSummary = String(
			translate( '%(highThreatsSummary)s and %(lowThreatsSummary)s', {
				args: {
					highThreatsSummary: highThreatsSummary,
					lowThreatsSummary: lowThreatsSummary,
				},
			} )
		);
	} else if ( highThreatsSummary ) {
		headerSummary = highThreatsSummary;
	} else if ( lowThreatsSummary ) {
		headerSummary = lowThreatsSummary;
	}

	if ( prefix ) {
		headerSummary = prefix + ' ' + headerSummary;
	}
	if ( suffix ) {
		headerSummary += ' ' + suffix;
	}

	return headerSummary;
};

const ScanThreats = ( { error, site, threats }: Props ) => {
	const { updatingThreats, selectedThreat, setSelectedThreat, fixThreats, updateThreat } =
		useThreats( site.ID );
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

	const confirmFixAllThreats = React.useCallback(
		( fixableThreats: Threat[] ) => {
			setShowFixAllThreatsDialog( false );
			fixThreats( fixableThreats as FixableThreat[] );
		},
		[ fixThreats ]
	);

	const isFixing = React.useCallback(
		( threat: Threat ) => {
			return (
				!! updatingThreats.find( ( threatId ) => threatId === threat.id ) ||
				threat.fixerStatus === 'in_progress'
			);
		},
		[ updatingThreats ]
	);

	const maxSeverity = threats.reduce( ( max, threat ) => Math.max( max, threat.severity ), 0 );
	const countMap = {
		low: threats.filter( ( threat ) => threat.severity < 3 ).length,
		high: threats.filter( ( threat ) => threat.severity >= 3 ).length,
	};
	const countMapFixable = {
		low: allFixableThreats.filter( ( threat ) => threat.severity < 3 ).length,
		high: allFixableThreats.filter( ( threat ) => threat.severity >= 3 ).length,
	};

	const headerSummary = getThreatCountMessage(
		countMap.high,
		countMap.low,
		null,
		String( translate( 'found' ) )
	);
	const fixSummary = getThreatCountMessage(
		countMapFixable.high,
		countMapFixable.low,
		String( translate( 'Jetpack can auto fix' ) ),
		null
	);

	let headerMessage = translate( 'Your site is at risk' );
	let securityIcon = 'error';

	if ( maxSeverity < 3 ) {
		headerMessage = translate( 'Your site is not at risk' );
		securityIcon = 'okay';
	}

	const highSeverityThreats = threats
		.filter( ( threat ) => threat.severity >= 3 )
		.sort( ( a, b ) => b.severity - a.severity );
	const lowSeverityThreats = threats.filter( ( threat ) => threat.severity < 3 );

	return (
		<>
			<Card className="scan-threats__card-header">
				<SecurityIcon icon={ securityIcon } className="scan-threats security-icon" />
				<h1 className="scan-threats scan__header">{ headerMessage }</h1>
				<p className="scan-threats__header-message">
					{ headerSummary }{ ' ' }
					{ maxSeverity < 3 && (
						<InfoPopover position="top" screenReaderText={ translate( 'Learn more' ) }>
							{ translate(
								'Low risk items could have a negative impact on your site and should either be fixed or ignored at your convenience.'
							) }
						</InfoPopover>
					) }
				</p>
				{ hasFixableThreats && (
					<>
						<div className="scan-threats__buttons">
							<p>{ fixSummary }</p>
							<Button
								primary
								className="scan-threats__fix-all-threats-button"
								onClick={ openFixAllThreatsDialog }
								disabled={ ! hasFixableThreats || updatingThreats.length > 0 }
							>
								{ translate( 'Show auto fixers' ) }
							</Button>
							<Button className="scan-threats__scan-secondary-button" onClick={ dispatchScanRun }>
								{ translate( 'Scan now' ) }
							</Button>
						</div>
					</>
				) }
				{ ! hasFixableThreats && (
					<Button primary className="scan-threats__button" onClick={ dispatchScanRun }>
						{ translate( 'Scan now' ) }
					</Button>
				) }
			</Card>
			<ThreatListHeader />
			<div className="scan-threats__threats">
				{ highSeverityThreats.length > 0 &&
					highSeverityThreats.map( ( threat ) => (
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
				{ highSeverityThreats.length === 0 &&
					lowSeverityThreats.length > 0 &&
					lowSeverityThreats.map( ( threat ) => (
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
				{ highSeverityThreats.length > 0 && lowSeverityThreats.length > 0 && (
					<div className="scan-threats__low-risk">
						<FoldableCard
							clickableHeader
							header={ <ThreatLowRiskItemHeader threatCount={ countMap.low } /> }
						>
							{ lowSeverityThreats.map( ( threat ) => (
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
						</FoldableCard>
					</div>
				) }
			</div>

			{ ! error && (
				<div className="scan-threats__rerun">
					<p className="scan-threats__rerun-help">
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
					</p>
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
