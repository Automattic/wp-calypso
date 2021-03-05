/**
 * External dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import { getLink } from 'woocommerce/lib/nav-utils';
import { localize } from 'i18n-calypso';

const GettingStarted = localize(
	( { translate, onClick, isPlaceholder, site, redirectToSettings } ) => {
		const allow = translate( 'Allow customers to subscribe to your Email list' );
		const send = translate( 'Send abandoned cart emails' );
		const create = translate( 'Create purchase-based segments for targeted campaigns' );
		const getStarted = translate( 'Get started with Mailchimp' );
		const list = [ allow, send, create ];
		const wizardLink = getLink( 'settings/email/:site/wizard', site );

		return (
			<div>
				<Card className="mailchimp__getting-started-title">
					<div className="mailchimp__getting-started-title-text">MailChimp</div>
					<div className="mailchimp__getting-started-subtitle-text">
						{ translate( 'Allow your customers to subscribe to your MailChimp email list.' ) }
					</div>
				</Card>
				{ ! isPlaceholder && (
					<Card className="mailchimp__getting-started-content">
						<span>
							<img
								src={ '/calypso/images/illustrations/illustration-layout.svg' }
								width={ 220 }
								alt=""
								className="mailchimp__getting-started-illustration"
							/>
						</span>
						<span>
							<h3 className="mailchimp__getting-started-list-header">
								{ translate( 'Connect with your customers through MailChimp' ) }
							</h3>
							<ul className="mailchimp__getting-started-list">
								{ list.map( ( item, key ) => (
									<li key={ key }>
										<Gridicon icon="checkmark" size={ 18 } />
										{ item }
									</li>
								) ) }
							</ul>
							{ ! redirectToSettings && (
								<Button className="mailchimp__getting-started-button" onClick={ onClick }>
									{ getStarted }
								</Button>
							) }
							{ redirectToSettings && (
								<Button className="mailchimp__getting-started-button" href={ wizardLink }>
									{ getStarted }
								</Button>
							) }
						</span>
					</Card>
				) }
				{ isPlaceholder && (
					<Card className="mailchimp__getting-started-loading-placeholder">
						<p />
						<p />
						<p />
						<p />
					</Card>
				) }
			</div>
		);
	}
);

GettingStarted.propTypes = {
	onClick: PropTypes.func.isRequired,
	isPlaceholder: PropTypes.bool,
	redirectToSettings: PropTypes.bool,
	site: PropTypes.object,
};

export default GettingStarted;
