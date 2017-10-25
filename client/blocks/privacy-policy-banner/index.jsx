/** @format */
/**
 * External dependencies
 *
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, identity } from 'lodash';

/**
 * Internal dependencies
 */
import { getPreference, isFetchingPreferences } from 'state/preferences/selectors';
import { savePreference } from 'state/preferences/actions';
import Banner from 'components/banner';
import PrivacyPolicyDialog from './privacy-policy-dialog';
import QueryPrivacyPolicy from 'components/data/query-privacy-policy';
import { getPrivacyPolicyByEntity } from 'state/selectors';
import { AUTOMATTIC_ENTITY, PRIVACY_POLICY_PREFERENCE } from './constants';

class PrivacyPolicyBanner extends Component {
	static propTypes = {
		isPolicyAlreadyAccepted: PropTypes.bool,
		privacyPolicy: PropTypes.object,
		privacyPolicyId: PropTypes.string,
		text: PropTypes.string,
		translate: PropTypes.func,
	};

	static defaultProps = {
		privacyPolicy: {},
		text: '',
		translate: identity,
	};

	state = {
		showDialog: false,
	};

	acceptUpdates = () => {
		if ( ! this.props.privacyPolicyId ) {
			return;
		}

		const { privacyPolicyId, privacyPolicyUserStatus } = this.props;
		this.props.acceptPrivacyPolicy( privacyPolicyId, privacyPolicyUserStatus );
	};

	openPrivacyPolicyDialog = () => this.setState( { showDialog: true } );

	closePrivacyPolicyDialog = () => {
		this.setState( { showDialog: false } );
		this.acceptUpdates();
	};

	getDescription( date ) {
		const { moment, translate } = this.props;

		return translate( "We're updating our privacy policy on %(date)s.", {
			args: {
				date: moment( date ).format( 'LL' ),
			},
		} );
	}

	openPrivacyPolicyDialog = () => this.setState( { showDialog: true } );

	closePrivacyPolicyDialog = () => {
		this.setState( { showDialog: false } );
		this.acceptUpdates();
	};

	render() {
		const {
			fetchingPreferences,
			isPolicyAlreadyAccepted,
			moment,
			privacyPolicy,
			translate,
		} = this.props;

		if ( fetchingPreferences ) {
			return null;
		}

		// check if the user has already accepted/read the privacy policy.
		if ( isPolicyAlreadyAccepted === true ) {
			return <QueryPrivacyPolicy />;
		}

		// check if the current policy is under the notification period.
		const notifyFrom = moment( get( privacyPolicy, 'notification_period.from' ) );
		const notifyTo = moment( get( privacyPolicy, 'notification_period.to' ) );
		if ( ! notifyFrom.isBefore() || ! notifyTo.isAfter() ) {
			return <QueryPrivacyPolicy />;
		}

		return (
			<div className="privacy-policy-banner">
				<QueryPrivacyPolicy />

				<Banner
					callToAction={ translate( 'Learn More' ) }
					description={ this.getDescription( privacyPolicy.modified ) }
					disableHref={ true }
					icon="pages"
					onClick={ this.openPrivacyPolicyDialog }
					title={ translate( 'Privacy Policy Updates.' ) }
				/>

				<PrivacyPolicyDialog
					isVisible={ this.state.showDialog }
					content={ privacyPolicy.content }
					title={ privacyPolicy.title }
					version={ privacyPolicy.id }

					onClose={ this.closePrivacyPolicyDialog }
					onDismiss={ this.closePrivacyPolicyDialog }
				/>
			</div>
		);
	}
}

const mapStateToProps = state => {
	const privacyPolicy = getPrivacyPolicyByEntity( state, AUTOMATTIC_ENTITY );
	const privacyPolicyUserStatus = getPreference( state, PRIVACY_POLICY_PREFERENCE ) || {};
	const privacyPolicyId = privacyPolicy.id;

	return {
		fetchingPreferences: isFetchingPreferences( state ),
		isPolicyAlreadyAccepted: privacyPolicyUserStatus[ privacyPolicyId ] || false,
		privacyPolicyUserStatus,
		privacyPolicy,
		privacyPolicyId,
	};
};

const mapDispatchToProps = {
	acceptPrivacyPolicy: ( privacyPolicyId, privacyPolicyUserStatus ) =>
		savePreference( PRIVACY_POLICY_PREFERENCE, {
			...privacyPolicyUserStatus,
			[ privacyPolicyId ]: true,
		} ),
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( PrivacyPolicyBanner ) );
