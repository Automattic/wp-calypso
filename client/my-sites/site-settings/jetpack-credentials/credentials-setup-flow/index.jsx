/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'gridicons';
import Button from 'components/button';
import CredentialsForm from '../credentials-form/index';

class CredentialsSetupFlow extends Component {
	static propTypes = {
		isPressable: PropTypes.bool,
		formIsSubmitting: PropTypes.bool,
		siteId: PropTypes.number,
		updateCredentials: PropTypes.func,
		autoConfigCredentials: PropTypes.func,
		autoConfigStatus: PropTypes.string
	};

	componentWillMount() {
		this.setState( { currentStep: 'start' } );
	}

	reset = () => {
		this.setState( { currentStep: 'start' } );
	};

	goToNextStep = () => {
		switch ( this.state.currentStep ) {
			case 'start':
				this.setState( { currentStep: 'tos' } );
				return;
			case 'tos':
				this.setState( { currentStep: 'form' } );
				return;
		}
	};

	autoConfigure = () => this.props.autoConfigCredentials( this.props.siteId );

	renderStepStart() {
		const {
			translate
		} = this.props;

		return (
			<CompactCard
				className="credentials-setup-flow__setup-start"
				onClick={ this.goToNextStep }
			>
				<Gridicon icon="add-outline" size={ 48 } className="credentials-setup-flow__header-gridicon" />
				<div className="credentials-setup-flow__header-text">
					<h3 className="credentials-setup-flow__header-text-title">{ translate( 'Add site credentials' ) }</h3>
					<h4 className="credentials-setup-flow__header-text-description">
						{ translate( 'Used to perform automatic actions on your server including backing up and restoring.' ) }
					</h4>
				</div>
			</CompactCard>
		);
	}

	renderStepTos() {
		const {
			isPressable,
			translate
		} = this.props;

		return (
			<CompactCard
				className="credentials-setup-flow__tos"
				highlight="info"
			>
				<Gridicon icon="info" size={ 48 } className="credentials-setup-flow__tos-gridicon" />
				<div className="credentials-setup-flow__tos-text">
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
						: <Button primary onClick={ this.goToNextStep }>{ translate( 'Ok, I understand' ) }</Button>
				}
			</CompactCard>
		);
	}

	renderStepForm() {
		const {
			formIsSubmitting,
			updateCredentials,
			siteId
		} = this.props;

		return (
			<CompactCard>
				<CredentialsForm { ...{
					formIsSubmitting,
					protocol: 'ssh',
					host: '',
					port: '',
					user: '',
					pass: '',
					abspath: '',
					kpub: '',
					onCancel: this.reset,
					siteId,
					updateCredentials,
				} } />
			</CompactCard>
		);
	}

	render() {
		return (
			<div className="credentials-setup-flow">
				{ 'start' === this.state.currentStep && this.renderStepStart() }
				{ 'tos' === this.state.currentStep && this.renderStepTos() }
				{ 'form' === this.state.currentStep && this.renderStepForm() }
			</div>
		);
	}
}

export default localize( CredentialsSetupFlow );
