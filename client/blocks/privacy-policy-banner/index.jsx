/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, identity } from 'lodash';

/**
 * Internal dependencies
 */
import { getHttpData, requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';
import { getPreference, isFetchingPreferences } from 'state/preferences/selectors';
import { savePreference } from 'state/preferences/actions';
import getCurrentUserRegisterDate from 'state/selectors/get-current-user-register-date';
import Banner from 'components/banner';
import config from 'config';
import PrivacyPolicyDialog from './privacy-policy-dialog';
import withMoment from 'components/with-localized-moment';

const AUTOMATTIC_ENTITY = 'automattic';
const PRIVACY_POLICY_PREFERENCE = 'privacy_policy';
const PRIVACY_POLICY_REQUEST_ID = 'privacy-policy';

const privacyPolicyQuery = {
	fetch() {
		requestHttpData(
			PRIVACY_POLICY_REQUEST_ID,
			http( {
				method: 'GET',
				path: '/privacy-policy',
				apiNamespace: 'wpcom/v2',
			} ),
			{
				fromApi: () => data => [
					// extract the "automattic" policy from the list of entities and ignore the other ones
					[ PRIVACY_POLICY_REQUEST_ID, get( data, [ 'entities', AUTOMATTIC_ENTITY ], null ) ],
				],
			}
		);
	},
	current() {
		return getHttpData( PRIVACY_POLICY_REQUEST_ID );
	},
};

class PrivacyPolicyBanner extends Component {
	static propTypes = {
		fetchingPreferences: PropTypes.bool,
		privacyPolicyPreferenceValue: PropTypes.object,
		privacyPolicy: PropTypes.object,
		userRegisterDate: PropTypes.number,
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	state = { showDialog: false };

	acceptUpdates() {
		if ( ! this.props.privacyPolicy ) {
			return;
		}

		this.props.acceptPrivacyPolicy(
			this.props.privacyPolicy.id,
			this.props.privacyPolicyPreferenceValue
		);
	}

	openPrivacyPolicyDialog = () => this.setState( { showDialog: true } );

	closePrivacyPolicyDialog = () => {
		this.setState( { showDialog: false } );
		this.acceptUpdates();
	};

	getDescription( date ) {
		if ( ! date ) {
			return null;
		}

		const { moment, translate } = this.props;

		return translate( "We're updating our privacy policy on %(date)s.", {
			args: {
				date: moment.utc( date ).format( 'LL' ),
			},
		} );
	}

	componentDidMount() {
		privacyPolicyQuery.fetch();
	}

	render() {
		if ( ! config.isEnabled( 'privacy-policy' ) ) {
			return null;
		}

		if ( this.props.fetchingPreferences ) {
			return null;
		}

		if ( ! this.props.privacyPolicy ) {
			return null;
		}

		const { moment, privacyPolicy, translate } = this.props;

		if ( ! config.isEnabled( 'privacy-policy/test' ) ) {
			// check if the user has already accepted/read the privacy policy.
			if ( get( this.props.privacyPolicyPreferenceValue, [ privacyPolicy.id ] ) === true ) {
				return null;
			}

			// check if the current policy is under the notification period.
			const notifyFrom = moment.utc( get( privacyPolicy, 'notification_period.from' ) );
			const notifyTo = moment.utc( get( privacyPolicy, 'notification_period.to' ) );

			if ( ! moment().isBetween( notifyFrom, notifyTo ) ) {
				return null;
			}

			// check if the register date of the user is after the notification period
			if ( moment( this.props.userRegisterDate ).isAfter( notifyFrom ) ) {
				return null;
			}
		}

		return (
			<Fragment>
				<Banner
					callToAction={ translate( 'Learn More' ) }
					description={ this.getDescription( privacyPolicy.effective_date ) }
					disableHref={ true }
					icon="pages"
					onClick={ this.openPrivacyPolicyDialog }
					title={ translate( 'Privacy Policy Updates.' ) }
				/>
				{ this.state.showDialog && (
					<PrivacyPolicyDialog
						isVisible
						content={ privacyPolicy.content }
						title={ privacyPolicy.title }
						version={ privacyPolicy.id }
						onClose={ this.closePrivacyPolicyDialog }
						onDismiss={ this.closePrivacyPolicyDialog }
					/>
				) }
			</Fragment>
		);
	}
}

const mapStateToProps = state => {
	return {
		fetchingPreferences: isFetchingPreferences( state ),
		privacyPolicyPreferenceValue: getPreference( state, PRIVACY_POLICY_PREFERENCE ),
		privacyPolicy: privacyPolicyQuery.current().data,
		userRegisterDate: getCurrentUserRegisterDate( state ),
	};
};

const mapDispatchToProps = {
	acceptPrivacyPolicy: ( privacyPolicyId, privacyPolicyPreferenceValue ) =>
		savePreference( PRIVACY_POLICY_PREFERENCE, {
			...privacyPolicyPreferenceValue,
			[ privacyPolicyId ]: true,
		} ),
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( withMoment( localize( PrivacyPolicyBanner ) ) );
