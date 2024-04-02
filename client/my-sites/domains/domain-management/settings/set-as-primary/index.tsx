import { FEATURE_SET_PRIMARY_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Accordion from 'calypso/components/domains/accordion';
import { type } from 'calypso/lib/domains/constants';
import { canSetAsPrimary } from 'calypso/lib/domains/utils/can-set-as-primary';
import { isRecentlyRegisteredAndDoesNotPointToWpcom } from 'calypso/lib/domains/utils/is-recently-registered-and-does-not-point-to-wpcom';
import { isUnderDomainManagementAll } from 'calypso/my-sites/domains/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { currentUserHasFlag, getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	showUpdatePrimaryDomainSuccessNotice,
	showUpdatePrimaryDomainErrorNotice,
} from 'calypso/state/domains/management/actions';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { setPrimaryDomain } from 'calypso/state/sites/domains/actions';
import type { SiteDetails } from '@automattic/data-stores';
import type { ResponseDomain } from 'calypso/lib/domains/types';

type SetAsPrimaryProps = {
	domain: ResponseDomain;
	selectedSite: SiteDetails;
};

const SetAsPrimary = ( { domain, selectedSite }: SetAsPrimaryProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isOnFreePlan = selectedSite?.plan?.is_free ?? false;
	const hasDomainOnlySite = useSelector( ( state ) => isDomainOnlySite( state, selectedSite.ID ) );
	const hasNonPrimaryDomainsFlag = useSelector( ( state ) =>
		getCurrentUser( state ) ? currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS ) : false
	);
	const isManagingAllSites = useSelector( ( state ) =>
		isUnderDomainManagementAll( getCurrentRoute( state ) )
	);
	const canSetPrimaryDomain = useSelector( ( state ) =>
		siteHasFeature( state, selectedSite.ID, FEATURE_SET_PRIMARY_CUSTOM_DOMAIN )
	);

	const [ isSettingPrimaryDomain, setIsSettingPrimaryDomain ] = useState( false );

	const shouldUpgradeToMakeDomainPrimary =
		hasNonPrimaryDomainsFlag &&
		isOnFreePlan &&
		( domain.type === type.REGISTERED || domain.type === type.MAPPED ) &&
		! hasDomainOnlySite &&
		! domain.isPrimary &&
		! domain.isWPCOMDomain &&
		! domain.isWpcomStagingDomain &&
		! canSetPrimaryDomain;

	if ( ! canSetAsPrimary( domain, isManagingAllSites, shouldUpgradeToMakeDomainPrimary ) ) {
		return null;
	}

	const handleSetPrimaryDomainClick = async () => {
		setIsSettingPrimaryDomain( true );
		dispatch(
			recordGoogleEvent(
				'Domain Management',
				'Changed Primary Domain in Settings',
				'Domain Name',
				domain.name
			)
		);
		dispatch(
			recordTracksEvent( 'calypso_domain_management_settings_change_primary_domain_click', {
				section: domain.type,
				mode: 'button_click',
			} )
		);
		try {
			await dispatch( setPrimaryDomain( selectedSite.ID, domain.name ) );
			dispatch( showUpdatePrimaryDomainSuccessNotice( domain.name ) );
		} catch ( error ) {
			dispatch( showUpdatePrimaryDomainErrorNotice( ( error as Error ).message ) );
		} finally {
			setIsSettingPrimaryDomain( false );
		}
	};

	const shouldDisableSetAsPrimaryButton = isRecentlyRegisteredAndDoesNotPointToWpcom( domain );

	return (
		<div className="set-as-primary">
			<Accordion
				title={ translate( 'Set as primary', { textOnly: true } ) }
				subtitle={ translate( 'Make this domain your primary site address', { textOnly: true } ) }
				isDisabled={ domain.isMoveToNewSitePending }
			>
				<p className="set-as-primary__content">
					{ translate( 'Your current primary site address is {{strong}}%(domainName)s{{/strong}}', {
						args: {
							domainName: selectedSite.domain,
						},
						components: {
							strong: <strong />,
						},
					} ) }
				</p>
				{ shouldDisableSetAsPrimaryButton && (
					<div className="set-as-primary__notice">
						<Icon
							icon={ info }
							size={ 18 }
							className="set-as-primary__notice-icon gridicon"
							viewBox="2 2 20 20"
						/>
						<div className="set-as-primary__notice-message">
							{ translate(
								"{{strong}}%(domainName)s{{/strong}} is still activating, so you can't set it as primary just yet.",
								{
									args: {
										domainName: domain.name,
									},
									components: {
										strong: <strong />,
									},
								}
							) }
						</div>
					</div>
				) }
				<Button
					onClick={ handleSetPrimaryDomainClick }
					busy={ isSettingPrimaryDomain }
					disabled={ shouldDisableSetAsPrimaryButton }
				>
					{ translate( 'Set {{strong}}%(domainName)s{{/strong}} as primary', {
						args: {
							domainName: domain.name,
						},
						components: {
							strong: <strong />,
						},
					} ) }
				</Button>
			</Accordion>
		</div>
	);
};

export default SetAsPrimary;
