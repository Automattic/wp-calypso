/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import CompactCard from 'components/card/compact';
import CredentialsForm from './credentials-form';
import Button from 'components/button';
import Popover from 'components/popover';
import Gridicon from 'gridicons';
import QueryRewindStatus from 'components/data/query-rewind-status';
import QueryJetpackCredentials from 'components/data/query-jetpack-credentials';
import { isRewindActive } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getJetpackCredentials,
	credentialsUpdating,
	hasMainCredentials,
	isSitePressable
} from 'state/jetpack/credentials/selectors';
import {
	updateCredentials as updateCredentialsAction,
	autoConfigCredentials as autoConfigCredentialsAction
} from 'state/jetpack/credentials/actions';

class Backups extends Component {
	static propTypes = {
		autoConfigStatus: PropTypes.string,
		credentialsUpdating: PropTypes.bool,
		hasMainCredentials: PropTypes.bool,
		mainCredentials: PropTypes.object,
		isPressable: PropTypes.bool,
		isRewindActive: PropTypes.bool,
		siteId: PropTypes.number.isRequired
	};

	componentWillMount() {
		this.setState( {
			setupStep: 1,
			showPopover: false,
		} );
	}

	goToNextSetupStep = () => {
		let currentStep = this.state.setupStep;
		currentStep++;
		this.setState( { setupStep: currentStep } );
	};

	loadCredentialsForm = () => this.setState( { setupStep: 3 } );

	resetSetup = () => this.setState( { setupStep: 1 } );

	togglePopover = () => this.setState( { showPopover: ! this.state.showPopover } );

	getProtocolDescription = ( protocol ) => {
		const {
			translate
		} = this.props;

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

	autoConfigure = () => this.props.autoConfigCredentials( this.props.siteId );

	renderFormFoldable() {
		const {
			mainCredentials,
			translate,
			isPressable
		} = this.props;

		const protocol = get( mainCredentials, 'protocol', 'SSH' ).toUpperCase();
		const description = this.getProtocolDescription( protocol );

		const header = (
			<div>
				<Gridicon icon="checkmark-circle" size={ 48 } className="site-settings__validated" />
				<div>
					<h3>{ protocol }</h3>
					<h4>{ description }</h4>
				</div>
			</div>
		);

		if ( isPressable ) {
			return (
				<CompactCard className="site-settings__pressable-configured">
					<Gridicon icon="checkmark-circle" size={ 48 } />
					<div>
						{ translate( 'You\'re all set! Your credentials have been ' +
							'automatically configured and your site is connected. ' +
							'Backups and restores should run seamlessly.'
						) }
					</div>
				</CompactCard>
			);
		}

		return (
			<FoldableCard
				header={ header }
				className="site-settings__foldable-header"
			>
				{ this.renderForm() }
			</FoldableCard>
		);
	}

	renderForm() {
		const {
			credentialsUpdating, // eslint-disable-line no-shadow
			siteId,
			updateCredentials,
		} = this.props;

		return (
			<CredentialsForm { ...{
				credentialsUpdating,
				protocol: get( this.props.mainCredentials, 'protocol', 'ssh' ),
				host: get( this.props.mainCredentials, 'host', '' ),
				port: get( this.props.mainCredentials, 'port', '' ),
				user: get( this.props.mainCredentials, 'user', '' ),
				pass: get( this.props.mainCredentials, 'pass', '' ),
				abspath: get( this.props.mainCredentials, 'abspath', '' ),
				kpub: get( this.props.mainCredentials, 'kpub', '' ),
				onCancel: this.resetSetup,
				siteId,
				updateCredentials,
			} } />
		);
	}

	renderSetupStart() {
		const {
			translate
		} = this.props;

		return (
			<CompactCard
				className="site-settings__setup-start"
				onClick={ this.goToNextSetupStep }
			>
				<Gridicon icon="add-outline" size={ 48 } />
				<div>
					<h3>{ translate( 'Add site credentials' ) }</h3>
					<h4>{ translate( 'Used to perform automatic actions on your server including backing up and restoring.' ) }</h4>
				</div>
			</CompactCard>
		);
	}

	renderSetupTos() {
		const {
			isPressable,
			translate
		} = this.props;

		return (
			<CompactCard
				className="site-settings__tos"
				highlight="info"
			>
				<div>
					<Gridicon icon="info" size={ 48 } />
				</div>
				<div>
					{
						isPressable
							? translate( 'WordPress.com can obtain the credentials from your ' +
								'current host which are necessary to perform site backups and ' +
								'restores. Do you want to give WordPress.com access to your ' +
								'host\'s server?' )
							: translate( 'By adding your site credentials, you are giving ' +
								'WordPress.com access to perform automatic actions on your ' +
								'server including backing up your site, restoring your site, ' +
								'as well as manually accessing your site in case of an emergency.' )
					}
				</div>
				{
					isPressable
						? <Button primary onClick={ this.autoConfigure }>{ translate( 'Auto Configure' ) }</Button>
						: <Button primary onClick={ this.loadCredentialsForm }>{ translate( 'Ok, I understand' ) }</Button>
				}
			</CompactCard>
		);
	}

	render() {
		const {
			autoConfigStatus,
			hasMainCredentials, // eslint-disable-line no-shadow
			isPressable,
			isRewindActive, // eslint-disable-line no-shadow
			translate,
		} = this.props;

		const { setupStep } = this.state;

		const autoConfigIdle = ( 'requesting' === autoConfigStatus || 'waiting' === autoConfigStatus );

		const pressableConfigureFlow = (
			<div>
				{ 1 === setupStep && this.renderSetupStart() }
				{ 2 === setupStep && autoConfigIdle && this.renderSetupTos() }
				{ 'success' === autoConfigStatus && this.renderFormFoldable() }
				{ hasMainCredentials && this.renderFormFoldable() }
			</div>
		);

		const selfHostedConfigureFlow = (
			<div>
				{ 1 === setupStep && this.renderSetupStart() }
				{ 2 === setupStep && this.renderSetupTos() }
				{3 === setupStep && (
					<CompactCard>
						{ this.renderForm() }
					</CompactCard>
				)}
				{ 4 === setupStep && this.renderFormFoldable() }
			</div>
		);

		return (
			<div className="site-settings__backups">
				<QueryRewindStatus siteId={ this.props.siteId } />
				<QueryJetpackCredentials siteId={ this.props.siteId } />
				{ isRewindActive && (
					<CompactCard className="site-settings__header">
						<span>{ translate( 'Backups and restores' ) }</span>
							{ hasMainCredentials && (
								<span className="site-settings__connected">
									<Gridicon icon="checkmark" size={ 18 } />
									{ translate( 'Connected' ) }
								</span>
							) }
					</CompactCard>
				) }
				{ isRewindActive && ! hasMainCredentials && isPressable && pressableConfigureFlow }
				{ isRewindActive && ! hasMainCredentials && ! isPressable && selfHostedConfigureFlow }
				{ isRewindActive && hasMainCredentials && this.renderFormFoldable() }
				{ isRewindActive && 4 !== setupStep && ! hasMainCredentials && (
					<CompactCard className="site-settings__footer">
						<a
							onClick={ this.togglePopover }
							ref="popoverLink"
						>
							<Gridicon icon="help" size={ 18 } />
							{
								3 === setupStep
									? translate( 'Need help finding your site\'s server credentials?' )
									: translate( 'Why do I need this?' )
							}
						</a>
						<Popover
							context={ this.refs && this.refs.popoverLink }
							isVisible={ get( this.state, 'showPopover', false ) }
							onClose={ this.togglePopover }
							className="site-settings__footer-popover"
							position="top"
						>
							{ translate(
								'These credentials are used to perform automatic actions ' +
								'on your server including backups and restores.'
							) }
						</Popover>
					</CompactCard>
				) }
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const credentials = getJetpackCredentials( state, 'main' );

		return {
			autoConfigStatus: state.jetpack.credentials.items.main === undefined ? 'requesting' : 'success',
			credentialsUpdating: credentialsUpdating( state ),
			hasMainCredentials: hasMainCredentials( state ),
			mainCredentials: credentials,
			isPressable: isSitePressable( state, siteId ),
			isRewindActive: isRewindActive( state, siteId ),
			siteId,
		};
	}, {
		autoConfigCredentials: autoConfigCredentialsAction,
		updateCredentials: updateCredentialsAction,
	}
)( localize( Backups ) );
