/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import { HAPPYCHAT_TRANSCRIPT_RECEIVE } from 'state/action-types';
import { requestTranscript } from '../middleware';

describe('middleware', () => {
    describe('HAPPYCHAT_TRANSCRIPT_REQUEST action', () => {
        it('should fetch transcript from connection and dispatch receive action', () => {
            const state = deepFreeze({
                happychat: {
                    timeline: [],
                },
            });
            const response = {
                messages: [{ text: 'hello' }],
                timestamp: 100000,
            };

            const connection = { transcript: stub().returns(Promise.resolve(response)) };
            const dispatch = stub();
            const getState = stub().returns(state);

            return requestTranscript(connection, { getState, dispatch }).then(() => {
                expect(connection.transcript).to.have.been.called;

                expect(dispatch).to.have.been.calledWith({
                    type: HAPPYCHAT_TRANSCRIPT_RECEIVE,
                    ...response,
                });
            });
        });
    });
});
