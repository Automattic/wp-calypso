import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import mailpoetSymbol from 'calypso/assets/images/email-providers/mailpoet-symbol.svg';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import SectionHeader from 'calypso/components/section-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getPluginOnSite, isRequesting } from 'calypso/state/plugins/installed/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export default function MailPoetUpsell() {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const isFetchingPlugins = useSelector( ( state ) => isRequesting( state, selectedSite?.ID ) );
	const mailpoetPlugin = useSelector( ( state ) =>
		getPluginOnSite( state, selectedSite?.ID, 'mailpoet' )
	);

	return (
		<>
			<QueryJetpackPlugins siteIds={ [ selectedSite?.ID ?? 0 ] } />

			{ ! isFetchingPlugins && ! mailpoetPlugin && (
				<div className="mailpoet-upsell">
					<SectionHeader label={ translate( 'Newsletters' ) } />

					<Card>
						<div className="mailpoet-upsell__icon">
							<img src={ mailpoetSymbol } alt="MailPoet logo" />
						</div>

						<div className="mailpoet-upsell__text">
							<h4>MailPoet</h4>
							<p>
								{ translate(
									'Create and send beautiful newsletters, post notifications, welcome emails and more from WordPress.com.'
								) }
							</p>
						</div>

						<Button
							href={ `/plugins/mailpoet/${ selectedSite?.slug }` }
							onClick={ () => {
								recordTracksEvent( 'calypso_email_management_mailpoet_upsell_click' );
							} }
						>
							{ translate( 'Add Plugin' ) }
						</Button>
					</Card>
				</div>
			) }
		</>
	);
}
