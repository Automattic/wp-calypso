import wpcom from 'calypso/lib/wp';
import {
	MEMBERSHIPS_COMP_ADD,
	MEMBERSHIPS_COMP_ADD_FAILURE,
	MEMBERSHIPS_COMP_DELETE,
	MEMBERSHIPS_COMP_DELETE_FAILURE,
} from 'calypso/state/action-types';
import { membershipCompFromApi } from 'calypso/state/data-layer/wpcom/sites/memberships';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import 'calypso/state/memberships/init';

export const requestAddComp = ( siteId, comp, noticeText, onComplete ) => {
	return ( dispatch ) => {
		dispatch( {
			comp,
			siteId,
			type: MEMBERSHIPS_COMP_ADD,
		} );

		const body = comp.no_expiration ? { no_expiration: true } : null;

		return wpcom.req
			.post(
				{
					method: 'POST',
					path: `/sites/${ siteId }/memberships/comps/${ encodeURIComponent( comp.user_id ) }/${
						comp.plan_id
					}`,
					apiNamespace: 'wpcom/v2',
				},
				body
			)
			.then( ( newComp ) => {
				if ( newComp.error ) {
					throw new Error( newComp.error );
				}
				const membershipComp = membershipCompFromApi( newComp );
				if ( noticeText ) {
					dispatch(
						successNotice( noticeText, {
							duration: 5000,
						} )
					);
				}

				onComplete?.( { success: true } );

				return membershipComp;
			} )
			.catch( ( error ) => {
				dispatch( {
					error,
					siteId,
					type: MEMBERSHIPS_COMP_ADD_FAILURE,
				} );
				dispatch(
					errorNotice( error.error?.message ?? error.message, {
						duration: 10000,
					} )
				);

				onComplete?.( { success: false } );
			} );
	};
};

export const requestDeleteComp = ( siteId, compId, noticeText ) => {
	return ( dispatch ) => {
		dispatch( {
			type: MEMBERSHIPS_COMP_DELETE,
			siteId,
			compId,
		} );

		return wpcom.req
			.post( {
				method: 'DELETE',
				path: `/sites/${ siteId }/memberships/comp/${ compId }`,
				apiNamespace: 'wpcom/v2',
			} )
			.then( () => {
				dispatch(
					successNotice( noticeText, {
						duration: 5000,
					} )
				);
			} )
			.catch( ( error ) => {
				dispatch( {
					type: MEMBERSHIPS_COMP_DELETE_FAILURE,
					siteId,
					error,
					compId,
				} );
				dispatch(
					errorNotice( error.message, {
						duration: 10000,
					} )
				);
				throw error;
			} );
	};
};
