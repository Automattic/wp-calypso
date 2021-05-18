/**
 * External dependencies
 */
import classnames from 'classnames';
import { CompactCard } from '@automattic/components';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import EmailPlanSubscription from 'calypso/my-sites/email/email-management/home/email-plan-subscription';
import EmailPlanWarnings from 'calypso/my-sites/email/email-management/home/email-plan-warnings';
import EmailTypeIcon from 'calypso/my-sites/email/email-management/home/email-type-icon';
import MaterialIcon from 'calypso/components/material-icon';
import { resolveEmailPlanStatus } from 'calypso/my-sites/email/email-management/home/utils';

const EmailPlanHeader = ( {
	domain,
	emailAccount,
	hasEmailSubscription,
	isLoadingEmails,
	isLoadingPurchase,
	purchase,
	selectedSite,
} ) => {
	if ( ! domain ) {
		return null;
	}

	const { statusClass, text, icon } = resolveEmailPlanStatus(
		domain,
		emailAccount,
		isLoadingEmails
	);

	const cardClasses = classnames( 'email-plan-header', statusClass );

	return (
		<>
			<CompactCard className={ cardClasses }>
				<span className="email-plan-header__icon">
					<EmailTypeIcon domain={ domain } />
				</span>

				<div>
					<h2>{ domain.name }</h2>

					<span className="email-plan-header__status">
						<MaterialIcon icon={ icon } /> { text }
					</span>
				</div>
			</CompactCard>

			{ hasEmailSubscription && <EmailPlanWarnings warnings={ emailAccount?.warnings } /> }

			{ hasEmailSubscription && (
				<EmailPlanSubscription
					purchase={ purchase }
					domain={ domain }
					selectedSite={ selectedSite }
					isLoadingPurchase={ isLoadingPurchase }
				/>
			) }
		</>
	);
};

EmailPlanHeader.propTypes = {
	domain: PropTypes.object.isRequired,
	emailAccount: PropTypes.object,
	isLoadingEmails: PropTypes.bool.isRequired,
	hasEmailSubscription: PropTypes.bool.isRequired,
	isLoadingPurchase: PropTypes.bool.isRequired,
	purchase: PropTypes.object,
	selectedSite: PropTypes.object.isRequired,
};

export default EmailPlanHeader;
