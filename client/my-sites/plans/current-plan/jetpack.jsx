/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';
import {
	isJetpackBusiness,
	isJetpackPremium
} from 'lib/products-values';

const JetpackPlanDetails = ( { selectedSite } ) => {
	const isPaid = ( isJetpackBusiness( selectedSite.plan ) || isJetpackPremium( selectedSite.plan ) );
	const isBusiness = isJetpackBusiness( selectedSite.plan );
	return (
		<div className="current-plan__details">
			{ isPaid && <PurchaseDetail
				icon="flag"
				title={ 'Backups & Security' }
				description={ i18n.translate(
					'VaultPress makes it easy to keep an up-to-date backup of your site with both daily and realtime syncing of all your WordPress content. To ensure your site stays safe, VaultPress performs security scans daily and makes it easy to review and fix threats.'
				) }
				buttonText={ i18n.translate( 'View your backups' ) }
				href="https://dashboard.vaultpress.com/" />
			}

			{ isPaid && <PurchaseDetail
				icon="comment"
				title={ 'Anti-Spam' }
				description={ i18n.translate(
					'Akismet filters out your comment spam for you, so you can focus on more important things.'
				) } />
			}

			{ isBusiness && <PurchaseDetail
				icon="list-checkmark"
				title={ 'Surveys & Polls' }
				description={ i18n.translate(
					'Unlimited surveys, unlimited responses. Use the survey editor to create surveys quickly and easily. Collect responses via your website, e-mail or on your iPad or iPhone'
				) }
				buttonText={ i18n.translate( 'Create a new poll' ) }
				href="https://polldaddy.com/dashboard/" />
			}

			{ isBusiness && <PurchaseDetail
				icon="add-outline"
				title={ 'Add additional sites' }
				description={ i18n.translate(
					'You can add an additional 2 sites to this plan.'
				) }
				buttonText={ i18n.translate( 'Add another site' ) }
				href="#" />
			}

			<PurchaseDetail
				icon="plugins"
				title={ 'Calypso Features' }
				description={ i18n.translate(
					'Enable plugin auto-updates, Browse your stats, Try out the new editor, {{a}}Download WordPress.com apps{{/a}}.',
					{
						components: {
							a: <a href="https://apps.wordpress.com/" />
						}
					}
				) }
				buttonText={ i18n.translate( 'Turn on autoupdates' ) }
				href={ `/plugins/${selectedSite.slug}` } />

			<PurchaseDetail
				icon="house"
				title={ 'Return to your site\'s dashboard' }
				buttonText={ i18n.translate( 'Go back to %(site)s', { args: { site: selectedSite.name } } ) }
				href={ `${selectedSite.URL}/wp-admin/` } />
		</div>
	);
};

export default JetpackPlanDetails;
