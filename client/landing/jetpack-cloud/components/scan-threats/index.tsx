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
import FixAllThreatsDialog from 'landing/jetpack-cloud/components/fix-all-threats-dialog';
import SecurityIcon from 'landing/jetpack-cloud/components/security-icon';
import ThreatDialog from 'landing/jetpack-cloud/components/threat-dialog';
import ThreatItem from 'landing/jetpack-cloud/components/threat-item';
import { Threat, ThreatAction } from 'landing/jetpack-cloud/components/threat-item/types';
import getJetpackCredentials from 'state/selectors/get-jetpack-credentials';
import { fixThreatAlert, ignoreThreatAlert } from 'state/jetpack/site-alerts/actions';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	site: {
		ID: number;
		name: string;
	};
	threats: Array< Threat >;
}

const ScanThreats = ( { site, threats }: Props ) => {
	const [ fixingThreats, setFixingThreats ] = React.useState< Array< Threat > >( [] );
	const [ selectedThreat, setSelectedThreat ] = React.useState< Threat >( threats[ 0 ] );
	const [ showThreatDialog, setShowThreatDialog ] = React.useState( false );
	const [ showFixAllThreatsDialog, setShowFixAllThreatsDialog ] = React.useState( false );
	const [ actionToPerform, setActionToPerform ] = React.useState< ThreatAction >( 'fix' );
	const userHasCredentials = useSelector(
		state => ! isEmpty( getJetpackCredentials( state, site.ID, 'main' ) )
	);
	const dispatch = useDispatch();

	const openFixAllThreatsDialog = React.useCallback( () => {
		setShowFixAllThreatsDialog( true );
	}, [] );

	const openDialog = React.useCallback( ( action: ThreatAction, threat: Threat ) => {
		setSelectedThreat( threat );
		setActionToPerform( action );
		setShowThreatDialog( true );
	}, [] );

	const closeDialog = React.useCallback( () => {
		setShowThreatDialog( false );
	}, [] );

	const confirmAction = React.useCallback( () => {
		const actionCreator = actionToPerform === 'fix' ? fixThreatAlert : ignoreThreatAlert;
		closeDialog();
		setFixingThreats( stateThreats => [ ...stateThreats, selectedThreat ] );
		dispatch( actionCreator( site.ID, selectedThreat.id ) );
	}, [ actionToPerform, closeDialog, dispatch, selectedThreat, site ] );

	const confirmFixAllThreats = React.useCallback( () => {
		threats.forEach( threat => {
			dispatch( fixThreatAlert( site.ID, threat.id ) );
		} );
		setShowFixAllThreatsDialog( false );
		setFixingThreats( threats );
	}, [ dispatch, site, threats ] );

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
						components: { a: <a href="https://jetpack.com/contact-support/" /> },
						comment: 'The {{a}} tag is a link that goes to a contact support page.',
					}
				) }
			</p>
			<div className="scan-threats__threats">
				<div className="scan-threats__buttons">
					<Button
						primary
						className="scan-threats__fix-all-threats-button"
						onClick={ openFixAllThreatsDialog }
						disabled={ fixingThreats.length === threats.length }
					>
						{ translate( 'Fix all' ) }
					</Button>
					<Button
						className="scan-threats__options-button"
						onClick={ openFixAllThreatsDialog }
						disabled={ fixingThreats.length === threats.length }
					>
						...
					</Button>
				</div>
				{ threats.map( threat => (
					<ThreatItem
						key={ threat.id }
						threat={ threat }
						onFixThreat={ () => openDialog( 'fix', threat ) }
						onIgnoreThreat={ () => openDialog( 'ignore', threat ) }
						isFixing={ !! fixingThreats.find( t => t.id === threat.id ) }
					/>
				) ) }
			</div>
			{ selectedThreat && (
				<ThreatDialog
					showDialog={ showThreatDialog }
					onCloseDialog={ closeDialog }
					onConfirmation={ confirmAction }
					siteName={ site.name }
					threatTitle={ selectedThreat.title }
					threatDescription={ selectedThreat.details }
					action={ actionToPerform }
				/>
			) }
			<FixAllThreatsDialog
				threats={ threats }
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
