/**
 * External dependencies
 */
import React from 'react';
import { numberFormat, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ThreatDialog from 'landing/jetpack-cloud/components/threat-dialog';
import ThreatItem from 'landing/jetpack-cloud/components/threat-item';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	site: object;
	threats: Array< object >;
}

const ScanThreats = ( { site, threats }: Props ) => {
	const [ showThreatDialog, setShowThreatDialog ] = React.useState( false );
	const [ actionToPerform, setActionToPerform ] = React.useState( '' );

	const openDialog = ( action: string ) => {
		setActionToPerform( action );
		setShowThreatDialog( true );
	};

	const closeDialog = () => {
		setShowThreatDialog( false );
	};

	const confirmAction = () => {
		window.alert( `Fixing site: ${ site.name }` );
		closeDialog();
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
			<div className="scan-threats scan__threats">
				{ threats.map( threat => (
					<ThreatItem
						key={ threat.id }
						threat={ threat }
						onFixThreat={ () => openDialog( 'fix' ) }
						onIgnoreThreat={ () => openDialog( 'ignore' ) }
					/>
				) ) }
			</div>
			<ThreatDialog
				showDialog={ showThreatDialog }
				onCloseDialog={ closeDialog }
				onConfirmation={ confirmAction }
				siteName={ site.name }
				threatTitle={ threats[ 0 ].title }
				threatDescription={ threats[ 0 ].details }
				action={ actionToPerform }
			/>
		</>
	);
};

export default ScanThreats;
