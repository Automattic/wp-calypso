import { isJetpackFreePlan, isFreePlan } from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { Notice } from '@wordpress/components';
import { useTranslate, fixMe } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import './style.scss';

export default function SubscriberImportLimitNotice() {
	const translate = useTranslate();
	const selectedSite = useSelector( ( state ) => getSelectedSite( state ) );
	const currentPlan = selectedSite?.plan?.product_slug || '';
	const isOnFreePlan = isFreePlan( currentPlan ) || isJetpackFreePlan( currentPlan );

	if ( ! isOnFreePlan || ! selectedSite?.ID ) {
		return null;
	}

	return (
		<Notice status="info" isDismissible={ false } className="subscribers-import-limit-notice">
			{ fixMe( {
				text: 'Import up to 100 subscribers on the Free plan. Upgrade to add more.',
				newCopy: translate(
					'Import {{supportLink}}up to 100 subscribers{{/supportLink}} on the Free plan. {{upgradeLink}}Upgrade{{/upgradeLink}} to add more.',
					{
						components: {
							supportLink: (
								<InlineSupportLink
									noWrap={ false }
									showIcon={ false }
									supportLink={ localizeUrl(
										'https://wordpress.com/support/import-subscribers-to-a-newsletter/#import-limits'
									) }
									supportPostId={ 220199 }
								/>
							),
							upgradeLink: <a href={ `/plans/${ selectedSite.slug }` } />,
						},
					}
				),
				oldCopy: translate(
					'Note: On the free plan, {{supportLink}}you can import up to 100 subscribers.{{/supportLink}}',
					{
						components: {
							supportLink: (
								<InlineSupportLink
									noWrap={ false }
									showIcon={ false }
									supportLink={ localizeUrl(
										'https://wordpress.com/support/import-subscribers-to-a-newsletter/#import-limits'
									) }
									supportPostId={ 220199 }
								/>
							),
						},
					}
				),
			} ) }
		</Notice>
	);
}
