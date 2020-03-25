/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { numberFormat, translate } from 'i18n-calypso';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FixAllThreatsDialog from '../../components/fix-all-threats-dialog';
import ThreatDialog from 'landing/jetpack-cloud/components/threat-dialog';
import ThreatItem from 'landing/jetpack-cloud/components/threat-item';
import { Threat, ThreatAction } from 'landing/jetpack-cloud/components/threat-item/types';
import getJetpackCredentials from 'state/selectors/get-jetpack-credentials';

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
	userHasCredentials: boolean;
	updateState?: Function;
}

type ScanThreatsState = 'threats-found' | 'fixing-threats';

const ThreatsFound = ( { site, threats, userHasCredentials, updateState }: Props ) => {
	const [ selectedThreat, setSelectedThreat ] = React.useState< Threat | undefined >();
	const [ showThreatDialog, setShowThreatDialog ] = React.useState( false );
	const [ showFixAllThreatsDialog, setShowFixAllThreatsDialog ] = React.useState( false );
	const [ actionToPerform, setActionToPerform ] = React.useState< ThreatAction >( 'fix' );

	const openFixAllThreatsDialog = React.useCallback( () => {
		setShowFixAllThreatsDialog( true );
	}, [] );

	const openDialog = React.useCallback( ( action: ThreatAction, threat: Threat ) => {
		setSelectedThreat( threat );
		setActionToPerform( action );
		setShowThreatDialog( true );
	}, [] );

	const closeDialog = React.useCallback( () => {
		setSelectedThreat( undefined );
		setShowThreatDialog( false );
	}, [] );

	const confirmAction = () => {
		window.alert(
			`We are going to ${ actionToPerform } threat ${ selectedThreat?.id } on site ${ site.name }`
		);
		closeDialog();
	};

	const confirmFixAllThreats = () => {
		window.alert( `Starting to fix ${ threats.length } threats found...` );
		setShowFixAllThreatsDialog( false );
		updateState && updateState();
	};

	return (
		<>
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
						className="scan-threats__fix-all-threats-button"
						onClick={ openFixAllThreatsDialog }
					>
						{ translate( 'Fix all' ) }
					</Button>
					<Button className="scan-threats__options-button" onClick={ openFixAllThreatsDialog }>
						...
					</Button>
				</div>
				{ threats.map( threat => (
					<ThreatItem
						key={ threat.id }
						threat={ threat }
						onFixThreat={ () => openDialog( 'fix', threat ) }
						onIgnoreThreat={ () => openDialog( 'ignore', threat ) }
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

const ScanThreats = ( { site, threats, userHasCredentials }: Props ) => {
	// In the future, we should compute the initial state from props instead of
	// having it defined here.
	const [ state, setState ] = React.useState< ScanThreatsState >( 'threats-found' );

	const setFixingThreatsState = React.useCallback( () => {
		setState( 'fixing-threats' );
	}, [] );

	const renderCurrentState = React.useCallback( () => {
		switch ( state ) {
			case 'threats-found':
				return (
					<ThreatsFound
						site={ site }
						threats={ threats }
						userHasCredentials={ userHasCredentials }
						updateState={ setFixingThreatsState }
					/>
				);
			case 'fixing-threats':
				return <h1>Fixing threats</h1>;
		}
	}, [ threats, site, state, userHasCredentials, setFixingThreatsState ] );

	return renderCurrentState();
};

const mapStateToProps = ( state, { site } ) => {
	return {
		userHasCredentials: ! isEmpty( getJetpackCredentials( state, site.ID, 'main' ) ),
	};
};

export default connect( mapStateToProps )( ScanThreats );
