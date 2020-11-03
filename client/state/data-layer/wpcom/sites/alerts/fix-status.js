/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { JETPACK_SCAN_THREATS_GET_FIX_STATUS } from 'calypso/state/action-types';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getFixThreatsStatus } from 'calypso/state/jetpack-scan/threats/actions';
import { requestScanStatus } from 'calypso/state/jetpack-scan/actions';
import { requestJetpackScanHistory } from 'calypso/state/jetpack-scan/history/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

const POLL_EVERY_MILLISECONDS = 1000;

export const request = ( action ) => {
	return [
		http(
			{
				apiNamespace: 'wpcom/v2',
				method: 'GET',
				path: `/sites/${ action.siteId }/alerts/fix/`,
				query: { threat_ids: action.threatIds },
			},
			{ ...action }
		),
	];
};

export const success = ( action, fixer_state ) => {
	const threatArray = Object.values( fixer_state.threats );

	const inProgressThreats = threatArray.filter( ( threat ) => threat.status === 'in_progress' );

	if ( inProgressThreats.length > 0 ) {
		return [
			( dispatch ) =>
				setTimeout(
					() => dispatch( getFixThreatsStatus( action.siteId, action.threatIds ) ),
					POLL_EVERY_MILLISECONDS
				),
		];
	}

	const fixedThreats = threatArray.filter( ( threat ) => threat.status === 'fixed' );

	if ( fixedThreats.length === action.threatIds.length ) {
		return [
			successNotice(
				i18n.translate(
					'The threat was successfully fixed.',
					'All threats were successfully fixed.',
					{ count: fixedThreats.length }
				),
				{
					duration: 4000,
				}
			),
			requestScanStatus( action.siteId ),
			// Since we can fix threats from the History section, we need to update that
			// information as well.
			requestJetpackScanHistory( action.siteId ),
		];
	}

	return [
		errorNotice( i18n.translate( 'Not all threats could be fixed. Please contact our support.' ), {
			duration: 4000,
		} ),
		requestScanStatus( action.siteId ),
		// Since we can fix threats from the History section, we need to update that
		// information as well.
		requestJetpackScanHistory( action.siteId ),
	];
};

export const failure = ( action ) =>
	errorNotice( i18n.translate( 'Error getting fixer status.' ), {
		duration: 10000,
		id: action.noticeId,
	} );

registerHandlers( 'state/data-layer/wpcom/sites/alerts/fix-status.js', {
	[ JETPACK_SCAN_THREATS_GET_FIX_STATUS ]: [
		dispatchRequest( {
			fetch: request,
			onSuccess: success,
			onError: failure,
		} ),
	],
} );
