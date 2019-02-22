/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import { ADDING_GOOGLE_APPS_TO_YOUR_SITE } from 'lib/url/support';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class GSuitePurchaseCtaFeatures extends React.Component {
	handleLearnMoreClick = () => {
		this.props.learnMoreClick( this.props.domainName );
	};

	getStorageText() {
		const { productSlug, translate } = this.props;
		if ( 'gapps' === productSlug ) {
			return translate( 'Get 30GB of storage for all your files synced across devices.' );
		} else if ( 'gappsbusiness' === productSlug ) {
			return translate( 'Get 30GB of storage for all your files synced across devices.' );
		}
	}

	render() {
		const { domainName, type, translate } = this.props;

		return (
			<Fragment>
				<div
					className={
						'grid' === type
							? 'gsuite-purchase-cta__add-google-apps-card-features-grid'
							: 'gsuite-purchase-cta__add-google-apps-card-features-list'
					}
				>
					<div className="gsuite-purchase-cta__add-google-apps-card-feature">
						<div className="gsuite-purchase-cta__add-google-apps-card-feature-block">
							<img alt="Gmail Logo" src="/calypso/images/g-suite/logo_gmail_48dp.svg" />
						</div>
						<div className="gsuite-purchase-cta__add-google-apps-card-feature-block">
							<h5 className="gsuite-purchase-cta__add-google-apps-card-feature-header">
								{ translate( 'Gmail for @%(domain)s', {
									args: {
										domain: domainName,
									},
								} ) }
							</h5>
							<p>
								{ translate( 'Professional ad-free email that works with most email clients.' ) }
							</p>
						</div>
					</div>

					<div className="gsuite-purchase-cta__add-google-apps-card-feature">
						<div className="gsuite-purchase-cta__add-google-apps-card-feature-block">
							<img alt="Google Drive Logo" src="/calypso/images/g-suite/logo_drive_48dp.svg" />
						</div>
						<div className="gsuite-purchase-cta__add-google-apps-card-feature-block">
							<h5 className="gsuite-purchase-cta__add-google-apps-card-feature-header">
								{ translate( 'Keep all your files secure' ) }
							</h5>
							<p>{ this.getStorageText() }</p>
						</div>
					</div>

					<div className="gsuite-purchase-cta__add-google-apps-card-feature">
						<div className="gsuite-purchase-cta__add-google-apps-card-feature-block">
							<img alt="Google Docs Logo" src="/calypso/images/g-suite/logo_docs_48dp.svg" />
						</div>
						<div className="gsuite-purchase-cta__add-google-apps-card-feature-block">
							<h5 className="gsuite-purchase-cta__add-google-apps-card-feature-header">
								{ translate( 'Docs, spreadsheets and forms' ) }
							</h5>
							<p>{ translate( 'Create and edit documents to get your work done faster.' ) }</p>
						</div>
					</div>

					<div className="gsuite-purchase-cta__add-google-apps-card-feature">
						<div className="gsuite-purchase-cta__add-google-apps-card-feature-block">
							<img
								alt="Google Hangouts Logo"
								src="/calypso/images/g-suite/logo_hangouts_48dp.svg"
							/>
						</div>
						<div className="gsuite-purchase-cta__add-google-apps-card-feature-block">
							<h5 className="gsuite-purchase-cta__add-google-apps-card-feature-header">
								{ translate( 'Connect with your team' ) }
							</h5>
							<p>
								{ translate(
									'Use text chats, voice calls, or video calls, with built in screen sharing'
								) }
							</p>
						</div>
					</div>
				</div>

				<div className="gsuite-purchase-cta__add-google-apps-card-learn-more">
					<p>
						{ translate(
							'{{strong}}No setup or software required.{{/strong}} ' +
								'{{a}}Learn more about integrating G Suite with your site.{{/a}}',
							{
								components: {
									strong: <strong />,
									a: (
										<a
											className="gsuite-purchase-cta__add-google-apps-card-learn-more-link"
											href={ ADDING_GOOGLE_APPS_TO_YOUR_SITE }
											target="_blank"
											rel="noopener noreferrer"
											onClick={ this.handleLearnMoreClick }
										/>
									),
								},
							}
						) }
					</p>
				</div>
			</Fragment>
		);
	}
}

const learnMoreClick = domainName =>
	composeAnalytics(
		recordTracksEvent( 'calypso_domain_management_gsuite_learn_more_click', {
			domain_name: domainName,
		} ),
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Learn more" G Suite link in Email',
			'Domain Name',
			domainName
		)
	);

GSuitePurchaseCtaFeatures.propTypes = {
	domainName: PropTypes.string.isRequired,
	productSlug: PropTypes.string.isRequired,
	type: PropTypes.oneOf( [ 'grid', 'list' ] ),
};

GSuitePurchaseCtaFeatures.defaultProps = {
	type: 'grid',
};

export default connect(
	null,
	{ learnMoreClick }
)( localize( GSuitePurchaseCtaFeatures ) );
