import { __ } from '@wordpress/i18n';
import page from 'page';
import wpcom from 'calypso/lib/wp';
import { domainManagementList, domainMappingSetup } from 'calypso/my-sites/domains/paths';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import isSiteOnPaidPlan from 'calypso/state/selectors/is-site-on-paid-plan';

const noop = () => null;
export const connectDomainAction = (
	{ domain, selectedSite, verificationData },
	onDone = noop
) => ( dispatch, getState ) => {
	const siteHasPaidPlan = isSiteOnPaidPlan( getState(), selectedSite.ID );

	if ( selectedSite.is_vip ) {
		wpcom
			.site( selectedSite.ID )
			.addVipDomainMapping( domain )
			.then( () => page( domainManagementList( selectedSite.slug ) ) )
			.catch( ( error ) => {
				dispatch( errorNotice( error.message ) );
				onDone();
			} );
	} else if ( siteHasPaidPlan ) {
		wpcom
			.site( selectedSite.ID )
			.addDomainMapping( domain, verificationData )
			.then( () => {
				dispatch(
					successNotice(
						__( 'Domain connected! Please make sure to follow the next steps below.' ),
						{
							isPersistent: true,
							duration: 10000,
						}
					)
				);
				page( domainMappingSetup( selectedSite.slug, domain ) );
			} )
			.catch( ( error ) => {
				if ( 'ownership_verification_failed' !== error.error ) {
					dispatch( errorNotice( error.message ) );
				}
				onDone( error );
			} );
	} else {
		page( '/checkout/' + selectedSite.slug + '/domain-mapping:' + domain );
	}
};
