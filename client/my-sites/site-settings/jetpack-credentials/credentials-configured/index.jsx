/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Gridicon from 'gridicons';
import FoldableCard from 'components/foldable-card';
import CompactCard from 'components/card/compact';
import CredentialsForm from '../credentials-form/index';

class CredentialsConfigured extends Component {
	getProtocolDescription = protocol => {
		const { translate } = this.props;

		switch ( protocol ) {
			case 'SSH':
				return translate( 'Secure Shell, the most complete and secure way to access your site.' );
			case 'SFTP':
				return translate( 'Secure File Transfer Protocol, a secure way to access your files.' );
			case 'FTP':
				return translate( 'File Transfer Protocol, a way to access your files.' );
			case 'PRESSABLE-SSH':
				return translate( 'A special Secure Shell connection to Pressable.' );
		}

		return '';
	};

	render() {
		const {
			isPressable,
			credentialsUpdating,
			mainCredentials,
			formIsSubmitting,
			siteId,
			updateCredentials,
			translate,
		} = this.props;

		const protocol = get( this.props.mainCredentials, 'protocol', 'SSH' ).toUpperCase();
		const protocolDescription = this.getProtocolDescription( protocol );

		if ( isPressable ) {
			return (
				<CompactCard className="credentials-configured">
					<Gridicon
						icon="checkmark-circle"
						size={ 48 }
						className="credentials-configured__header-gridicon"
					/>
					<div className="credentials-configured__header-configured-text">
						{ translate(
							"You're all set! Your credentials have been " +
								'automatically configured and your site is connected. ' +
								'Backups and restores should work seamlessly.'
						) }
					</div>
				</CompactCard>
			);
		}

		const header = (
			<div className="credentials-configured__header">
				<Gridicon
					icon="checkmark-circle"
					size={ 48 }
					className="credentials-configured__header-gridicon"
				/>
				<div className="credentials-configured__header-text">
					<h3 className="credentials-configured__header-protocol">{ protocol }</h3>
					<h4 className="credentials-configured__header-description">{ protocolDescription }</h4>
				</div>
			</div>
		);

		return (
			<FoldableCard header={ header } className="credentials-configured">
				<CredentialsForm
					{ ...{
						credentialsUpdating,
						protocol: get( mainCredentials, 'protocol', 'ssh' ),
						host: get( mainCredentials, 'host', '' ),
						port: get( mainCredentials, 'port', '' ),
						user: get( mainCredentials, 'user', '' ),
						pass: get( mainCredentials, 'pass', '' ),
						abspath: get( mainCredentials, 'abspath', '' ),
						kpri: get( mainCredentials, 'kpri', '' ),
						formIsSubmitting,
						siteId,
						updateCredentials,
						showCancelButton: false,
					} }
				/>
			</FoldableCard>
		);
	}
}

export default localize( CredentialsConfigured );
