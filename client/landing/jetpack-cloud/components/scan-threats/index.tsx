/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { numberFormat, translate } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import { Button, Card } from '@automattic/components';

/**
 * Internal dependencies
 */
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
import { fixThreatAlert, ignoreThreatAlert } from 'state/jetpack/site-alerts/actions';
import contactSupportUrl from 'landing/jetpack-cloud/lib/contact-support-url';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	site: {
		ID: number;
		name: string;
		URL: string;
	};
	threats: Array< Threat >;
	error: boolean;
}

// @todo: once we have designs for the "error+threats found" case, we should update this component
const ScanError = () => (
	<Card highlight="error">
		Something went wrong with the most recent Scan. Please, get in touch with support to get more
		information. <br />
		Despite this error, we can inform you we have found threats in your site.
	</Card>
);

const ScanThreats = ( { error, site, threats }: Props ) => {
	const [ fixingThreats, setFixingThreats ] = React.useState< Array< Threat > >( [] );
	const [ selectedThreat, setSelectedThreat ] = React.useState< Threat >( threats[ 0 ] );
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
		[ dispatch, site ]
	);

	const closeDialog = React.useCallback( () => {
		setShowThreatDialog( false );
	}, [] );

	const confirmAction = React.useCallback( () => {
		const eventName =
			actionToPerform === 'fix' ? 'calypso_scan_threat_fix' : 'calypso_scan_threat_ignore';
		dispatch(
			recordTracksEvent( eventName, {
				site_id: site.ID,
				threat_signature: selectedThreat.signature,
			} )
		);
		const actionCreator = actionToPerform === 'fix' ? fixThreatAlert : ignoreThreatAlert;
		closeDialog();
		setFixingThreats( ( stateThreats ) => [ ...stateThreats, selectedThreat ] );
		dispatch( actionCreator( site.ID, selectedThreat.id, true ) );
	}, [ actionToPerform, closeDialog, dispatch, selectedThreat, site ] );

	const confirmFixAllThreats = React.useCallback( () => {
		dispatch(
			recordTracksEvent( `calypso_scan_all_threats_fix`, {
				site_id: site.ID,
				threats_number: allFixableThreats.length,
			} )
		);
		allFixableThreats.forEach( ( threat ) => {
			dispatch( fixThreatAlert( site.ID, threat.id ) );
		} );
		setShowFixAllThreatsDialog( false );
		setFixingThreats( allFixableThreats );
	}, [ allFixableThreats, dispatch, site ] );

	return (
		<>
			<SecurityIcon icon="error" />
			<h1 className="scan-threats scan__header">{ translate( 'Your site may be at risk' ) }</h1>
			{ error && <ScanError /> }
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
							disabled={ fixingThreats.length === threats.length }
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
						isFixing={ !! fixingThreats.find( ( t ) => t.id === threat.id ) }
						contactSupportUrl={ contactSupportUrl( site.URL ) }
					/>
				) ) }
			</div>
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
