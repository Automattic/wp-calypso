/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, map, noop } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import { getEligibility, isEligibleForAutomatedTransfer } from 'state/automated-transfer/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import SectionHeader from 'components/section-header';
import QueryEligibility from 'components/data/query-atat-eligibility';

// Mapping eligibility holds to messages that will be shown to the user
// TODO: update supportUrls and maybe create similar mapping for warnings
function getHoldMessages( translate ) {
	return {
		PLACEHOLDER: {
			title: '',
			description: '',
			supportUrl: '',
		},
		MULTIPLE_USERS: {
			title: translate( 'Multiple users' ),
			description: translate( 'This feature is not supported on sites with multiple users.' ),
			supportUrl: 'https://support.wordpress.com/'
		},
		NO_BUSINESS_PLAN: {
			title: translate( 'Business plan required' ),
			description: translate( 'This feature is only allowed on sites with business plan.' ),
			supportUrl: 'https://support.wordpress.com/'
		},
		NO_VIP_SITES: {
			title: translate( 'VIP Site' ),
			description: translate( 'This feature is not supported on VIP sites.' ),
			supportUrl: 'https://support.wordpress.com/'
		},
		NO_WPCOM_NAMESERVERS: {
			title: translate( 'No WordPress.com Name Servers' ),
			description: translate( 'Your custom domain must point to WordPress.com name servers.' ),
			supportUrl: 'https://support.wordpress.com/'
		},
		NON_ADMIN_USER: {
			title: translate( 'Admin access required' ),
			description: translate( 'Only site administrators are allowed to use this feature' ),
			supportUrl: 'https://support.wordpress.com/'
		},
		NOT_USING_CUSTOM_DOMAIN: {
			title: translate( 'No custom domain' ),
			description: translate( 'Your site must use custom domain in order for this feature to work.' ),
			supportUrl: 'https://support.wordpress.com/'
		},
		SITE_GRAYLISTED: {
			title: translate( 'Flagged site' ),
			description: translate( 'This feature is not supported on sites that are not in good standing.' ),
			supportUrl: 'https://support.wordpress.com/'
		},
		SITE_PRIVATE: {
			title: translate( 'Private site' ),
			description: translate( 'This feature is not supported on private sites.' ),
			supportUrl: 'https://support.wordpress.com/'
		}
	};
}

const EligibilityWarnings = props => {
	const {
		translate,
		backUrl,
		onProceed,
		siteId,
		isEligible,
		eligibilityData,
		isPlaceholder,
	} = props;

	const holdMessages = getHoldMessages( translate );
	const holds = get( eligibilityData, 'eligibilityHolds', [ 'PLACEHOLDER', 'PLACEHOLDER' ] );
	const warnings = get( eligibilityData, 'eligibilityWarnings', [] );

	const classes = classNames( {
		'eligibility-warnings__message': true,
		'eligibility-warnings__placeholder': isPlaceholder,
	} );

	return (
		<div className="eligibility-warnings">
			<QueryEligibility siteId={ siteId } />
			<SectionHeader label={ translate( 'Conflicts' ) } />

			{ map( holds, ( error, index ) =>
				<Card key={ index } className={ classes }>
					<Gridicon icon="notice" className="eligibility-warnings__error-icon" />
					<div className="eligibility-warnings__message-content">
						<div className="eligibility-warnings__message-title">
							{ translate( 'Error: %(title)s', { args: { title: holdMessages[ error ].title } } ) }
						</div>
						<div className="eligibility-warnings__message-description">
							{ holdMessages[ error ].description }
						</div>
					</div>
					<div className="eligibility-warnings__message-action">
						<Button href={ holdMessages[ error ].supportUrl } target="_blank" rel="noopener noreferrer">
							{ translate( 'Resolve' ) }
						</Button>
					</div>
				</Card>
			) }

			{ map( warnings, ( { name, description, supportUrl }, index ) =>
				<Card key={ index } className={ classes }>
					<Gridicon icon="notice" className="eligibility-warnings__warning-icon" />
					<div className="eligibility-warnings__message-content">
						<div className="eligibility-warnings__message-title">
							{ translate( 'Unsupported feature: %(name)s', { args: { name } } ) }
						</div>
						<div className="eligibility-warnings__message-description">
							{ description }
						</div>
					</div>
					<div className="eligibility-warnings__message-action">
						<a href={ supportUrl } target="_blank" rel="noopener noreferrer">
							<Gridicon icon="help-outline" className="eligibility-warnings__warning-action" />
						</a>
					</div>
				</Card>
			) }

			<Card className="eligibility-warnings__confirm-box">
				<Gridicon icon="info-outline" className="eligibility-warnings__confirm-icon" />
				<div className="eligibility-warnings__confirm-text">
					{ ! isEligible && translate(
						'You must resolve the errors above before proceeding. '
					) }
					{ isEligible && translate(
						'If you proceed you will no longer be able to use these features. '
					) }
					{ translate( 'Have questions? Please {{a}}contact support{{/a}}.',
						{
							components: {
								a: <a href="https://wordpress.com/help/contact" target="_blank" rel="noopener noreferrer" />
							}
						}
					) }
				</div>
				<div className="eligibility-warnings__buttons">
					<Button href={ backUrl }>
						{ translate( 'Cancel' ) }
					</Button>

					<Button primary={ true } disabled={ ! isEligible } onClick={ onProceed }>
						{ translate( 'Proceed' ) }
					</Button>
				</div>
			</Card>
		</div>
	);
};

EligibilityWarnings.propTypes = {
	onProceed: PropTypes.func,
	backUrl: PropTypes.string,
	translate: PropTypes.func,
};

EligibilityWarnings.defaultProps = {
	onProceed: noop,
};

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const eligibilityData = getEligibility( state, siteId );
	const dataLoaded = !! eligibilityData.lastUpdate;

	return {
		siteId,
		eligibilityData,
		isEligible: isEligibleForAutomatedTransfer( state, siteId ),
		isPlaceholder: ! dataLoaded,
	};
};

export default connect( mapStateToProps )( localize( EligibilityWarnings ) );
