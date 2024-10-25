import { PRODUCT_JETPACK_SCAN, WPCOM_FEATURES_SCAN } from '@automattic/calypso-products';
import { ToggleControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import React, { useCallback, useMemo } from 'react';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useWafMutation, useWafQuery } from './data';
/**
 * Automatic Firewall Rules Setting
 */
export default function AutomaticRules() {
	const { data: waf, isLoading } = useWafQuery();
	const { mutate: updateWaf, isPending: isUpdating } = useWafMutation();

	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const hasScan = useSelector( ( state ) => siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN ) );

	const automaticRulesLastUpdated = useMemo( () => {
		const timestamp = parseInt( waf?.automatic_rules_last_updated );
		if ( timestamp ) {
			return moment( timestamp * 1000 ).format( 'MMMM D, YYYY h:mm A' );
		}
		return '';
	}, [ waf?.automatic_rules_last_updated ] );

	const toggleAutomaticRules = useCallback( () => {
		updateWaf( {
			jetpack_waf_automatic_rules: ! waf?.jetpack_waf_automatic_rules,
		} );
	}, [ updateWaf, waf?.jetpack_waf_automatic_rules ] );

	// Do not render if the WAF is not supported.
	if ( ! waf || ! waf?.waf_supported ) {
		return null;
	}

	return (
		<FormFieldset>
			<ToggleControl
				disabled={ isLoading || isUpdating || ( ! hasScan && ! waf?.automatic_rules_available ) }
				onChange={ toggleAutomaticRules }
				checked={ !! waf?.jetpack_waf_automatic_rules }
				label={
					<>
						<div>{ translate( 'Automatic firewall protection' ) }</div>
						{ automaticRulesLastUpdated && (
							<FormSettingExplanation>
								{ translate( 'Automatic security rules installed. Last updated on %(date)s.', {
									args: {
										date: automaticRulesLastUpdated,
									},
								} ) }
							</FormSettingExplanation>
						) }
						<FormSettingExplanation>
							{ translate(
								'Block untrusted traffic by scanning every request made to your site. Jetpack’s security rules are always up-to-date to protect against the latest threats.'
							) }
						</FormSettingExplanation>
						<UpsellNudge
							className="site-settings__security-settings-firewall-nudge"
							title={
								waf?.automatic_rules_available
									? translate( 'Your site is not receiving the latest updates to automatic rules' )
									: translate( 'Set up automatic rules with one click' )
							}
							description={
								waf?.automatic_rules_available
									? translate( 'Upgrade to keep your site secure with up-to-date firewall rules' )
									: translate( 'Upgrade to enable automatic firewall protection.' )
							}
							callToAction={ translate( 'Upgrade now' ) }
							primaryButton
							event="calypso_scan_settings_upgrade_nudge"
							feature={ WPCOM_FEATURES_SCAN }
							href={ `/checkout/${ selectedSiteSlug }/${ PRODUCT_JETPACK_SCAN }?redirect_to=/scan/firewall/${ selectedSiteSlug }` }
						/>
					</>
				}
			/>
		</FormFieldset>
	);
}
