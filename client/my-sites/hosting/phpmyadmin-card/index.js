import { Card, Button } from '@automattic/components';
import { PanelBody } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import ExternalLink from 'calypso/components/external-link';
import MaterialIcon from 'calypso/components/material-icon';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import wpcom from 'calypso/lib/wp';
import {
	composeAnalytics,
	recordTracksEvent,
	recordGoogleEvent,
	bumpStat,
} from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import RestorePasswordDialog from './restore-db-password';

import './style.scss';

const trackOpenPhpmyadmin = () =>
	composeAnalytics(
		recordGoogleEvent(
			'Hosting Configuration',
			'Clicked "Open phpMyAdmin" Button in phpMyAdmin Card'
		),
		recordTracksEvent( 'calypso_hosting_configuration_open_phpmyadmin' ),
		bumpStat( 'hosting-config', 'open-phpmyadmin' )
	);

export default function PhpMyAdminCard( { disabled } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );

	const [ loading, setLoading ] = useState( false );
	const [ isRestorePasswordDialogVisible, setIsRestorePasswordDialogVisible ] = useState( false );

	async function openPmaLink() {
		setLoading( true );
		try {
			const { token } = await wpcom.req.post( {
				path: `/sites/${ siteId }/hosting/pma/token`,
				apiNamespace: 'wpcom/v2',
			} );

			if ( token ) {
				dispatch( trackOpenPhpmyadmin() );
				window.open( `https://wordpress.com/pma-login?token=${ token }` );
			}
		} catch {
			// ignore errors
		}
		setLoading( false );
	}

	return (
		<Card className="phpmyadmin-card">
			<MaterialIcon icon="dns" size={ 32 } />
			<CardHeading>{ translate( 'Database Access' ) }</CardHeading>
			<p>
				{ translate(
					'For the tech-savvy, manage your database with phpMyAdmin and run a wide range of operations with MySQL.'
				) }
			</p>
			<div className="phpmyadmin-card__questions">
				<PanelBody title={ translate( 'What is phpMyAdmin?' ) } initialOpen={ false }>
					{ translate(
						"It is a free open source software tool that allows you to administer your site's MySQL database over the Web. For more information see {{a}}phpMyAdmin and MySQL{{/a}}",
						{
							components: {
								a: (
									<ExternalLink
										icon
										target="_blank"
										href={ localizeUrl( 'https://wordpress.com/support/phpmyadmin-and-mysql/' ) }
									/>
								),
							},
						}
					) }
				</PanelBody>
			</div>
			<p className="phpmyadmin-card__db-warning">
				{ translate(
					'Managing a database can be tricky and it’s not necessary for your site to function.'
				) }
			</p>
			<Button onClick={ openPmaLink } busy={ ! disabled && loading } disabled={ disabled }>
				<span>{ translate( 'Open phpMyAdmin' ) }</span>
				<MaterialIcon icon="launch" size={ 16 } />
			</Button>
			{ ! disabled && (
				<div className="phpmyadmin-card__restore-password">
					{ translate( 'Having problems with access? Try {{a}}resetting the password{{/a}}.', {
						components: {
							a: (
								<Button
									compact
									borderless
									onClick={ () => setIsRestorePasswordDialogVisible( true ) }
								/>
							),
						},
					} ) }
				</div>
			) }
			<RestorePasswordDialog
				isVisible={ isRestorePasswordDialogVisible }
				onCancel={ () => setIsRestorePasswordDialogVisible( false ) }
				onRestore={ () => setIsRestorePasswordDialogVisible( false ) }
			/>
		</Card>
	);
}
