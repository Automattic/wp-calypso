/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Gridicon from 'gridicons';
import Button from 'components/button';
import CredentialsForm from '../credentials-form/index';
import Popover from 'components/popover';

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
		this.setState( {
			currentStep: 'start',
			showPopover: false
		} );
	}

	togglePopover = () => this.setState( { showPopover: ! this.state.showPopover } );

	reset = () => this.setState( { currentStep: 'start' } );

	getNextStep = step => get( {
		start: 'tos',
		tos: 'form',
	}, step, step );

	goToNextStep = () => this.setState( {
		currentStep: this.getNextStep( this.state.currentStep )
	} );

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
				<div className="credentials-setup-flow__tos-buttons">
					<Button borderless={ true } onClick={ this.reset }>{ translate( 'Cancel' ) }</Button>
					{
						isPressable
							? <Button primary onClick={ this.autoConfigure }>{ translate( 'Auto Configure' ) }</Button>
							: <Button primary onClick={ this.goToNextStep }>{ translate( 'Ok, I understand' ) }</Button>
					}
				</div>
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
					kpri: '',
					onCancel: this.reset,
					siteId,
					updateCredentials,
					showCancelButton: true
				} } />
			</CompactCard>
		);
	}

	render() {
		const {
			translate
		} = this.props;

		return (
			<div className="credentials-setup-flow">
				{ 'start' === this.state.currentStep && this.renderStepStart() }
				{ 'tos' === this.state.currentStep && this.renderStepTos() }
				{ 'form' === this.state.currentStep && this.renderStepForm() }
				<CompactCard className="credentials-setup-flow__footer">
					<a
						onClick={ this.togglePopover }
						ref="popoverLink"
						className="credentials-setup-flow__footer-popover-link"
					>
						<Gridicon icon="help" size={ 18 } className="credentials-setup-flow__footer-popover-icon" />
						{ translate( 'Why do I need this?' ) }
					</a>
					<Popover
						context={ this.refs && this.refs.popoverLink }
						isVisible={ get( this.state, 'showPopover', false ) }
						onClose={ this.togglePopover }
						className="credentials-setup-flow__footer-popover"
						position="top"
					>
						{ translate(
							'These credentials are used to perform automatic actions ' +
							'on your server including backups and restores.'
						) }
					</Popover>
				</CompactCard>
			</div>
		);
	}
}

export default localize( CredentialsSetupFlow );
