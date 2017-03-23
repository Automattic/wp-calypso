/**
 * External dependencies
 */
import sinon from 'sinon';
import { assert, expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import {
    READER_START_GRADUATE_REQUEST,
    READER_START_GRADUATE_REQUEST_SUCCESS,
    READER_START_GRADUATED,
} from 'state/action-types';
import { requestGraduate } from 'state/reader/start/actions';

describe('actions', () => {
    const spy = sinon.spy();

    beforeEach(() => {
        spy.reset();
    });

    describe('#requestGraduate', () => {
        const sampleResponse = { success: true };
        useNock(nock => {
            nock('https://public-api.wordpress.com:443')
                .post('/rest/v1.2/read/graduate-new-reader')
                .reply(200, deepFreeze(sampleResponse));
        });

        it('should dispatch properly when receiving a valid response', () => {
            const dispatchSpy = sinon.stub();
            dispatchSpy.withArgs(sinon.match.instanceOf(Promise)).returnsArg(0);
            const request = requestGraduate()(dispatchSpy);
            expect(dispatchSpy).to.have.been.calledWith({
                type: READER_START_GRADUATE_REQUEST,
            });
            return request
                .then(() => {
                    expect(dispatchSpy).to.have.been.calledWith({
                        type: READER_START_GRADUATE_REQUEST_SUCCESS,
                        data: sampleResponse,
                    });

                    expect(dispatchSpy).to.have.been.calledWith({
                        type: READER_START_GRADUATED,
                    });
                })
                .catch(err => {
                    assert.fail(err, undefined, 'errback should not have been called');
                });
        });
    });
});
