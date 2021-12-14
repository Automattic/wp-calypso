import { FEATURE_SET_PRIMARY_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { connect } from 'react-redux';
import Accordion from 'calypso/components/domains/accordion';
import { type } from 'calypso/lib/domains/constants';
import { isUnderDomainManagementAll } from 'calypso/my-sites/domains/paths';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { currentUserHasFlag, getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	showUpdatePrimaryDomainSuccessNotice,
	showUpdatePrimaryDomainErrorNotice,
} from 'calypso/state/domains/management/actions';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import hasActiveSiteFeature from 'calypso/state/selectors/has-active-site-feature';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import { setPrimaryDomain } from 'calypso/state/sites/domains/actions';
import type {
	SetAsPrimaryProps,
	SetAsPrimaryPassedProps,
	SetAsPrimaryStateProps,
	ChangePrimaryFunctionSignature,
} from './types';

const SetAsPrimary = ( props: SetAsPrimaryProps ): JSX.Element | null => {
	const translate = useTranslate();
	const [ isSettingPrimaryDomain, setIsSettingPrimaryDomain ] = useState( false );
	const {
		domain,
		hasDomainOnlySite,
		isOnFreePlan,
		hasNonPrimaryDomainsFlag,
		canSetPrimaryDomain,
		isManagingAllSites,
		selectedSite,
	} = props;

	const shouldUpgradeToMakeDomainPrimary = () => {
		return (
			hasNonPrimaryDomainsFlag &&
			isOnFreePlan &&
			( domain.type === type.REGISTERED || domain.type === type.MAPPED ) &&
			! hasDomainOnlySite &&
			! domain.isPrimary &&
			! domain.isWPCOMDomain &&
			! domain.isWpcomStagingDomain &&
			! canSetPrimaryDomain
		);
	};

	const canSetAsPrimary = () => {
		return (
			! isManagingAllSites &&
			domain &&
			domain.canSetAsPrimary &&
			! domain.isPrimary &&
			! shouldUpgradeToMakeDomainPrimary()
		);
	};

	const setPrimaryDomain = ( domainName: string ) => {
		return new Promise( ( resolve, reject ) => {
			props.setPrimaryDomain( selectedSite.ID, domainName, ( error, data ) => {
				if ( ! error && data && data.success ) {
					resolve( null );
				} else {
					reject( error );
				}
			} );
		} );
	};

	const handleSetPrimaryDomainClick = async () => {
		setIsSettingPrimaryDomain( true );
		props.changePrimary( domain, 'button_click' );
		try {
			await setPrimaryDomain( domain.name );
			props.showUpdatePrimaryDomainSuccessNotice( domain.name );
		} catch ( error ) {
			props.showUpdatePrimaryDomainSuccessNotice( domain.name );
		} finally {
			setIsSettingPrimaryDomain( false );
		}
	};
	if ( ! canSetAsPrimary() ) return null;
	return (
		<div className="set-as-primary">
			<Accordion
				title={ translate( 'Set as primary' ) }
				subtitle={ translate( 'Make this domain your primary site address' ) }
			>
				<p className="set-as-primary__content">
					{ translate( 'Your current primary site address is %(domainName)s', {
						args: {
							domainName: domain.name,
						},
					} ) }
				</p>
				<Button onClick={ handleSetPrimaryDomainClick } busy={ isSettingPrimaryDomain }>
					{ translate( 'Set this domain as primary' ) }
				</Button>
			</Accordion>
		</div>
	);
};

const changePrimary: ChangePrimaryFunctionSignature = ( domain, mode ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Changed Primary Domain to in Settings',
			'Domain Name',
			domain.name
		),
		recordTracksEvent( 'calypso_domain_management_settings_change_primary_domain_click', {
			section: domain.type,
			mode,
		} )
	);

export default connect(
	( state, ownProps: SetAsPrimaryPassedProps ): SetAsPrimaryStateProps => {
		const { selectedSite } = ownProps;
		const isOnFreePlan = selectedSite?.plan?.is_free || false;
		return {
			hasDomainOnlySite: !! isDomainOnlySite( state, selectedSite.ID ),
			hasNonPrimaryDomainsFlag: getCurrentUser( state )
				? currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
				: false,
			isOnFreePlan,
			isManagingAllSites: isUnderDomainManagementAll( getCurrentRoute( state ) ),
			canSetPrimaryDomain: hasActiveSiteFeature(
				state,
				selectedSite.ID,
				FEATURE_SET_PRIMARY_CUSTOM_DOMAIN
			),
		};
	},
	{
		changePrimary,
		setPrimaryDomain,
		showUpdatePrimaryDomainErrorNotice,
		showUpdatePrimaryDomainSuccessNotice,
	}
)( SetAsPrimary );
