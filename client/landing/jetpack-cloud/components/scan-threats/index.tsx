/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { numberFormat, translate } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import FixAllThreatsDialog from 'landing/jetpack-cloud/components/fix-all-threats-dialog';
import SecurityIcon from 'landing/jetpack-cloud/components/security-icon';
import ThreatDialog from 'landing/jetpack-cloud/components/threat-dialog';
import ThreatItem from 'landing/jetpack-cloud/components/threat-item';
import {
	FixableThreat,
	Threat,
	ThreatAction,
} from 'landing/jetpack-cloud/components/threat-item/types';
import { recordTracksEvent } from 'state/analytics/actions';
import getJetpackCredentials from 'state/selectors/get-jetpack-credentials';
import contactSupportUrl from 'landing/jetpack-cloud/lib/contact-support-url';
import { useThreats } from 'landing/jetpack-cloud/lib/use-threats';
import { triggerScanRun } from 'landing/jetpack-cloud/lib/trigger-scan-run';

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
			{ translate( 'The scanner was unable to check all files and errored before completion.' ) }
			<br />
			{ isEnabled( 'jetpack-cloud/on-demand-scan' )
				? translate(
						'Deal with the threats found above and run the {{runScan}}scan again{{/runScan}}. If the error persists, we are {{linkToSupport}}here to help{{/linkToSupport}}.',
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
						'Deal with the threats found above and if the error persists, we are {{linkToSupport}}here to help{{/linkToSupport}}.',
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
	const userHasCredentials = useSelector(
		( state ) => ! isEmpty( getJetpackCredentials( state, site.ID, 'main' ) )
	);
	const dispatch = useDispatch();

	const allFixableThreats = threats.filter(
		( threat ): threat is FixableThreat => threat.fixable !== false
	);
	const hasFixableThreats = !! allFixableThreats.length;

	const openFixAllThreatsDialog = React.useCallback( () => {
		dispatch(
			recordTracksEvent( `calypso_scan_all_threats_dialog_open`, {
				site_id: site.ID,
			} )
		);
		setShowFixAllThreatsDialog( true );
	}, [ dispatch, site ] );

	const openDialog = React.useCallback(
		( action: ThreatAction, threat: Threat ) => {
			const eventName =
				action === 'fix'
					? 'calypso_scan_fix_threat_dialog_open'
					: 'calypso_scan_ignore_threat_dialog_open';
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
					'Please review them below and take action. We are {{a}}here to help{{/a}} if you need us.',
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
							disabled={ updatingThreats.length === threats.length }
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
						isFixing={ !! updatingThreats.find( ( t ) => t.id === threat.id ) }
						contactSupportUrl={ contactSupportUrl( site.URL ) }
						isPlaceholder={ false }
					/>
				) ) }
			</div>

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
				siteId={ site.ID }
				onCloseDialog={ () => setShowFixAllThreatsDialog( false ) }
				onConfirmation={ confirmFixAllThreats }
				userHasCredentials={ userHasCredentials }
			/>
		</>
	);
};

export default ScanThreats;
