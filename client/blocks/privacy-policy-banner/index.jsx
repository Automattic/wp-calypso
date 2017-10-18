/** @format */
/**
 * External dependencies
 *
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getPreference, isFetchingPreferences } from 'state/preferences/selectors';
import { savePreference } from 'state/preferences/actions';
import { identity } from 'lodash';
import Banner from 'components/banner';
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

	acceptUpdates = () => {
		if ( ! this.props.privacyPolicyId ) {
			return;
		}

		const { privacyPolicyId, privacyPolicyState } = this.props;
		this.props.acceptPrivacyPolicy( privacyPolicyId, privacyPolicyState );
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

	render() {
		const { fetchingPreferences, isPolicyAlreadyAccepted, translate } = this.props;

		if ( fetchingPreferences ) {
			return null;
		}

		if ( isPolicyAlreadyAccepted === true ) {
			return <QueryPrivacyPolicy />;
		}

		return (
			<div className="privacy-policy-banner">
				<QueryPrivacyPolicy />
				<Banner
					callToAction={ translate( 'Learn More' ) }
					description={ this.getDescription( this.props.privacyPolicy.modified ) }
					disableHref={ true }
					icon="pages"
					href="https://automattic.com/privacy/"
					target="_blank"
					onClick={ this.acceptUpdates }
					title={ translate( 'Privacy Policy Updates.' ) }
				/>
			</div>
		);
	}
}

const mapStateToProps = state => {
	const privacyPolicy = getPrivacyPolicyByEntity( state, AUTOMATTIC_ENTITY );
	const privacyPolicyState = getPreference( state, PRIVACY_POLICY_PREFERENCE ) || {};
	const privacyPolicyId = privacyPolicy.id;

	return {
		fetchingPreferences: isFetchingPreferences( state ),
		isPolicyAlreadyAccepted: privacyPolicyState[ privacyPolicyId ] || false,
		privacyPolicyState,
		privacyPolicy,
		privacyPolicyId,
	};
};

const mapDispatchToProps = {
	acceptPrivacyPolicy: ( privacyPolicyId, privacyPolicyState ) =>
		savePreference( PRIVACY_POLICY_PREFERENCE, {
			...privacyPolicyState,
			[ privacyPolicyId ]: true,
		} ),
};

export default connect( mapStateToProps, mapDispatchToProps )(
	localize( PrivacyPolicyBanner )
);
