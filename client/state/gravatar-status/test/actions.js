import { GRAVATAR_UPLOAD_REQUEST } from 'calypso/state/action-types';
import { receiveGravatarImageFailed, uploadGravatar } from '../actions';

const dispatch = jest.fn();

describe( 'actions', () => {
	describe( '#uploadGravatar', () => {
		test( 'dispatches request action with the file and email', () => {
			const action = uploadGravatar( 'file', 'email' );
			expect( action.type ).toEqual( GRAVATAR_UPLOAD_REQUEST );
			expect( action.file ).toEqual( 'file' );
			expect( action.email ).toEqual( 'email' );
		} );
	} );

	describe( '#receiveGravatarImageFailed', () => {
		test( 'dispatches image receive failure action with error message', () => {
			const errorMessage = 'error';
			const statName = 'statName';
			receiveGravatarImageFailed( {
				errorMessage,
				statName,
			} )( dispatch );
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: 'ANALYTICS_EVENT_RECORD',
					meta: {
						analytics: [
							{
								type: 'ANALYTICS_EVENT_RECORD',
								payload: {
									name: 'calypso_edit_gravatar_file_receive_failure',
									service: 'tracks',
								},
							},
						],
					},
				} )
			);

			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: 'ANALYTICS_STAT_BUMP',
					meta: {
						analytics: [
							{
								type: 'ANALYTICS_STAT_BUMP',
								payload: {
									group: 'calypso_gravatar_update_error',
									name: 'statName',
								},
							},
						],
					},
				} )
			);

			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: 'NOTICE_CREATE',
					notice: {
						text: errorMessage,
						status: 'is-error',
						noticeId: 'gravatar-upload',
						showDismiss: true,
					},
				} )
			);
		} );
	} );
} );
