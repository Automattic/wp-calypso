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
import GSuitePurchaseFeaturesSingleFeature from './single-feature';

/**
 * Style dependencies
 */
import './style.scss';

class GSuitePurchaseFeatures extends React.Component {
	handleLearnMoreClick = () => {
		this.props.learnMoreClick( this.props.domainName );
	};

	getStorageText() {
		const { productSlug, translate } = this.props;
		if ( 'gapps' === productSlug ) {
			return translate( 'Get 30GB of storage for all your files synced across devices.' );
		} else if ( 'gapps_unlimited' === productSlug ) {
			return translate( 'Get unlimited storage for all your files synced across devices.' );
		}
	}

	render() {
		const { domainName, type, translate } = this.props;

		return (
			<Fragment>
				<div
					className={
						'grid' === type
							? 'gsuite-purchase-features__features-grid'
							: 'gsuite-purchase-features__features-list'
					}
				>
					<GSuitePurchaseFeaturesSingleFeature
						title={ translate( 'A custom @%(domain)s email address', {
							args: {
								domain: domainName,
							},
						} ) }
						description={ translate(
							'Professional ad-free email that works with most email clients.'
						) }
						imagePath={ '/calypso/images/g-suite/logo_gmail_48dp.svg' }
						imageAlt={ 'Gmail Logo' }
					/>
					<GSuitePurchaseFeaturesSingleFeature
						title={ translate( 'Docs, spreadsheets and more' ) }
						description={ translate(
							'Collaborate in real-time with documents, spreadsheets and slides.'
						) }
						imagePath={ '/calypso/images/g-suite/logo_docs_48dp.svg' }
						imageAlt={ 'Google Docs Logo' }
					/>
					<GSuitePurchaseFeaturesSingleFeature
						title={ translate( 'Keep all your files secure' ) }
						description={ this.getStorageText() }
						imagePath={ '/calypso/images/g-suite/logo_drive_48dp.svg' }
						imageAlt={ 'Google Drive Logo' }
					/>
					<GSuitePurchaseFeaturesSingleFeature
						title={ translate( 'Connect with your team' ) }
						description={ translate(
							'Use text chats, voice calls, or video calls, with built in screen sharing.'
						) }
						imagePath={ '/calypso/images/g-suite/logo_hangouts_48dp.svg' }
						imageAlt={ 'Google Hangouts Logo' }
					/>
				</div>

				<div className="gsuite-purchase-features__learn-more">
					<p>
						{ translate(
							'{{strong}}No setup or software required.{{/strong}} ' +
								'{{a}}Learn more about integrating G Suite with your site.{{/a}}',
							{
								components: {
									strong: <strong />,
									a: (
										<a
											className="gsuite-purchase-features__learn-more-link"
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

GSuitePurchaseFeatures.propTypes = {
	domainName: PropTypes.string.isRequired,
	productSlug: PropTypes.string.isRequired,
	type: PropTypes.oneOf( [ 'grid', 'list' ] ),
};

GSuitePurchaseFeatures.defaultProps = {
	type: 'grid',
};

export default connect(
	null,
	{ learnMoreClick }
)( localize( GSuitePurchaseFeatures ) );
