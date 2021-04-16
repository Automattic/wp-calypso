/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { concat } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormattedHeader from 'calypso/components/formatted-header';
import {
	getPlan,
	JETPACK_RESET_PLANS,
	JETPACK_PRODUCTS_LIST,
	getJetpackProductShortName,
	getJetpackProductDescription,
	PRODUCTS_LIST,
} from '@automattic/calypso-products';
import { FLOW_TYPES } from 'calypso/jetpack-connect/flow-types';
import { retrievePlan } from './persistence-utils';

class JetpackConnectMainHeader extends Component {
	static propTypes = {
		type: PropTypes.oneOf( concat( FLOW_TYPES, false ) ),
	};

	getTexts() {
		const { translate, type } = this.props;
		const selectedPlan = retrievePlan();

		if (
			type === 'pro' ||
			selectedPlan === 'jetpack_business' ||
			selectedPlan === 'jetpack_business_monthly'
		) {
			return {
				title: translate( 'Get Jetpack Professional' ),
				subtitle: translate(
					'WordPress sites from start to finish: unlimited premium themes, ' +
						'business class security, and marketing automation.'
				),
			};
		}

		if (
			type === 'premium' ||
			selectedPlan === 'jetpack_premium' ||
			selectedPlan === 'jetpack_premium_monthly'
		) {
			return {
				title: translate( 'Get Jetpack Premium' ),
				subtitle: translate(
					'Automated backups and malware scanning, expert priority support, ' +
						'marketing automation, and more.'
				),
			};
		}

		if (
			type === 'personal' ||
			selectedPlan === 'jetpack_personal' ||
			selectedPlan === 'jetpack_personal_monthly'
		) {
			return {
				title: translate( 'Get Jetpack Personal' ),
				subtitle: translate(
					'Security essentials for your WordPress site ' +
						'including automated backups and priority support.'
				),
			};
		}

		if ( type === 'install' ) {
			return {
				title: translate( 'Install Jetpack' ),
				subtitle: translate(
					'Jetpack brings free themes, security services, and essential marketing tools ' +
						'to your self-hosted WordPress site.'
				),
			};
		}

		if ( JETPACK_RESET_PLANS.includes( type ) ) {
			const plan = getPlan( type );

			if ( plan ) {
				return {
					title: translate( 'Get {{name/}}', {
						components: {
							name: <>{ plan.getTitle() }</>,
						},
						comment: '{{name/}} is the name of a plan',
					} ),
					subtitle: plan.getDescription(),
				};
			}
		}

		if ( JETPACK_PRODUCTS_LIST.includes( type ) ) {
			const product = PRODUCTS_LIST[ type ];

			if ( product ) {
				return {
					title: translate( 'Get {{name/}}', {
						components: {
							name: <>{ getJetpackProductShortName( product ) }</>,
						},
						comment: '{{name/}} is the name of a plan',
					} ),
					subtitle: getJetpackProductDescription( product ),
				};
			}
		}

		return {
			title: translate( 'Set up Jetpack on your self-hosted WordPress' ),
			subtitle: translate(
				"We'll be installing the Jetpack plugin so WordPress.com can communicate with " +
					'your self-hosted WordPress site.'
			),
		};
	}

	render() {
		const { title, subtitle } = this.getTexts();

		return <FormattedHeader headerText={ title } subHeaderText={ subtitle } />;
	}
}

export default localize( JetpackConnectMainHeader );
