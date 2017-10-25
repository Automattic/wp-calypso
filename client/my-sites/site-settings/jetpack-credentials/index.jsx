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
import CredentialsForm from './credentials-form/index';
import CredentialsSetupFlow from './credentials-setup-flow/index';
import Popover from 'components/popover';
import Gridicon from 'gridicons';
import QueryRewindStatus from 'components/data/query-rewind-status';
import QueryJetpackCredentials from 'components/data/query-jetpack-credentials';
import { isRewindActive } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getJetpackCredentials,
	isUpdatingJetpackCredentials,
	hasMainCredentials,
	isSitePressable,
	getCredentialsAutoConfigStatus
} from 'state/selectors';
import {
	updateCredentials as updateCredentialsAction,
	autoConfigCredentials as autoConfigCredentialsAction
} from 'state/jetpack/credentials/actions';

class Backups extends Component {
	static propTypes = {
		autoConfigStatus: PropTypes.string,
		formIsSubmitting: PropTypes.bool,
		hasMainCredentials: PropTypes.bool,
		mainCredentials: PropTypes.object,
		isPressable: PropTypes.bool,
		isRewindActive: PropTypes.bool,
		siteId: PropTypes.number.isRequired
	};

	componentWillMount() {
		this.setState( { showPopover: false } );
	}

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

	renderConfiguredView() {
		const {
			mainCredentials,
			translate,
			isPressable,
			credentialsUpdating,
			updateCredentials,
			siteId,
			formIsSubmitting
		} = this.props;

		const protocol = get( mainCredentials, 'protocol', 'SSH' ).toUpperCase();
		const description = this.getProtocolDescription( protocol );

		const header = (
			<div className="jetpack-credentials__header">
				<Gridicon icon="checkmark-circle" size={ 48 } className="jetpack-credentials__header-gridicon" />
				<div className="jetpack-credentials__header-text">
					<h3 className="jetpack-credentials__header-protocol">{ protocol }</h3>
					<h4 className="jetpack-credentials__header-description">{ description }</h4>
				</div>
			</div>
		);

		if ( isPressable ) {
			return (
				<CompactCard className="jetpack-credentials__pressable-configured">
					<Gridicon icon="checkmark-circle" size={ 48 } className="jetpack-credentials__header-gridicon" />
					<div className="jetpack-credentials__header-configured-text">
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
				className="jetpack-credentials__foldable-header"
			>
				<CredentialsForm { ...{
					credentialsUpdating,
					protocol: get( this.props.mainCredentials, 'protocol', 'ssh' ),
					host: get( this.props.mainCredentials, 'host', '' ),
					port: get( this.props.mainCredentials, 'port', '' ),
					user: get( this.props.mainCredentials, 'user', '' ),
					pass: get( this.props.mainCredentials, 'pass', '' ),
					abspath: get( this.props.mainCredentials, 'abspath', '' ),
					kpri: get( this.props.mainCredentials, 'kpri', '' ),
					formIsSubmitting,
					siteId,
					updateCredentials,
					showCancelButton: false
				} } />
			</FoldableCard>
		);
	}

	render() {
		const {
			autoConfigStatus,
			hasMainCredentials, // eslint-disable-line no-shadow
			isPressable,
			isRewindActive, // eslint-disable-line no-shadow
			translate,
			formIsSubmitting,
			updateCredentials,
			siteId,
			autoConfigCredentials
		} = this.props;

		return (
			<div className="jetpack-credentials">
				<QueryRewindStatus siteId={ this.props.siteId } />
				<QueryJetpackCredentials siteId={ this.props.siteId } />
				{ isRewindActive && (
					<CompactCard className="jetpack-credentials__header">
						<span>{ translate( 'Backups and restores' ) }</span>
							{ hasMainCredentials && (
								<span className="jetpack-credentials__connected">
									<Gridicon icon="checkmark" size={ 18 } className="jetpack-credentials__connected-checkmark" />
									{ translate( 'Connected' ) }
								</span>
							) }
					</CompactCard>
				) }
				{ isRewindActive && hasMainCredentials && this.renderConfiguredView() }
				{ isRewindActive && ! hasMainCredentials && (
					<CredentialsSetupFlow
						isPressable={ isPressable }
						formIsSubmitting={ formIsSubmitting }
						siteId={ siteId }
						updateCredentials={ updateCredentials }
						autoConfigCredentials={ autoConfigCredentials }
						autoConfigStatus={ autoConfigStatus }
					/>
				) }
				{ isRewindActive && ! hasMainCredentials && (
					<CompactCard className="jetpack-credentials__footer">
						<a
							onClick={ this.togglePopover }
							ref="popoverLink"
							className="jetpack-credentials__footer-popover-link"
						>
							<Gridicon icon="help" size={ 18 } className="jetpack-credentials__footer-popover-icon" />
							{ translate( 'Why do I need this?' ) }
						</a>
						<Popover
							context={ this.refs && this.refs.popoverLink }
							isVisible={ get( this.state, 'showPopover', false ) }
							onClose={ this.togglePopover }
							className="jetpack-credentials__footer-popover"
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
		const credentials = getJetpackCredentials( state, siteId, 'main' );

		return {
			autoConfigStatus: getCredentialsAutoConfigStatus( state, siteId ),
			formIsSubmitting: isUpdatingJetpackCredentials( state, siteId ),
			hasMainCredentials: hasMainCredentials( state, siteId ),
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
