/**
 * External dependencies
 */
import { expect } from 'chai';
import mockery from 'mockery';
import noop from 'lodash/noop';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe('actions', function() {
    let actions,
        mockSites,
        fetchResponder = function(callback) {
            callback();
        },
        serverActionHandler = noop;

    useMockery();

    before(function() {
        mockery.registerAllowable('../actions');
        mockery.registerMock('../store', {
            get: function() {
                return mockSites;
            },
        });
        mockery.registerMock('./store', {
            get: function() {
                return mockSites;
            },
        });
        mockery.registerMock('lib/wp', {
            undocumented: function() {
                return {
                    fetchSiteRecommendations: function(args, callback) {
                        fetchResponder(args, callback);
                    },
                };
            },
        });
        mockery.registerMock('dispatcher', {
            handleServerAction: function(payload) {
                serverActionHandler(payload);
            },
        });
        actions = require('../actions');
    });

    beforeEach(function() {
        mockSites = [];
    });

    it('mock took', function() {
        const store = require('../store');
        expect(store.get()).to.be.eql([]);
        mockSites.push(5);
        expect(store.get()).to.be.eql([5]);
    });

    it('fetching more invokes the right things', function() {
        fetchResponder = sinon.stub();
        fetchResponder.callsArgWith(1, null, {});

        serverActionHandler = sinon.spy();

        actions.fetchMore();

        expect(fetchResponder.callCount).to.equal(1);
        expect(fetchResponder.args[0][0]).to.eql({
            number: 10,
            source: 'reader_sidebar',
            meta: 'site',
        });

        expect(serverActionHandler.callCount).to.equal(1);
        expect(serverActionHandler.args[0][0].error).to.be.undefined;
        expect(serverActionHandler.args[0][0].data).to.be.ok;
        expect(serverActionHandler.args[0][0].type).to.be.equal('receive_site_recommendations');
    });

    it('fetching more errors invoke the error action', function() {
        fetchResponder = sinon.stub();
        fetchResponder.callsArgWith(1, 'foo', null);

        serverActionHandler = sinon.spy();

        actions.fetchMore();

        expect(fetchResponder.callCount).to.equal(1);
        expect(fetchResponder.args[0][0]).to.eql({
            number: 10,
            source: 'reader_sidebar',
            meta: 'site',
        });

        expect(serverActionHandler.callCount).to.equal(1);
        expect(serverActionHandler.args[0][0].error).to.be.equal('foo');
        expect(serverActionHandler.args[0][0].data).to.be.not.ok;
        expect(serverActionHandler.args[0][0].type).to.be.equal(
            'receive_site_recommendations_error'
        );
    });

    it('fetching more with existing items excludes the existing items', function() {
        fetchResponder = sinon.stub();
        fetchResponder.callsArgWith(1, null, {});

        serverActionHandler = sinon.spy();

        mockSites.push({ blog_id: 1 }, { blog_id: 2 });

        actions.fetchMore();

        expect(fetchResponder.callCount).to.equal(1);
        expect(fetchResponder.args[0][0]).to.eql({
            exclude: [1, 2],
            number: 10,
            source: 'reader_sidebar',
            meta: 'site',
        });

        expect(serverActionHandler.callCount).to.equal(1);
        expect(serverActionHandler.args[0][0].error).to.be.undefined;
        expect(serverActionHandler.args[0][0].data).to.be.ok;
        expect(serverActionHandler.args[0][0].type).to.be.equal('receive_site_recommendations');
    });

    it('meta sites are dispatch appropriately', function() {
        fetchResponder = sinon.stub();
        fetchResponder.callsArgWith(1, null, {
            blogs: [
                {
                    meta: {
                        data: {
                            site: { ID: 1, title: 'site 1' },
                        },
                    },
                },
                {
                    meta: {
                        data: {
                            site: { ID: 2, title: 'site 2' },
                        },
                    },
                },
            ],
        });

        serverActionHandler = sinon.spy();

        actions.fetchMore();

        expect(fetchResponder.callCount).to.equal(1);
        expect(fetchResponder.args[0][0]).to.eql({
            number: 10,
            source: 'reader_sidebar',
            meta: 'site',
        });

        expect(serverActionHandler.callCount).to.equal(3);
        expect(serverActionHandler.args[0][0].error).to.be.undefined;
        expect(serverActionHandler.args[0][0].data).to.be.ok;
        expect(serverActionHandler.args[0][0].type).to.be.equal('RECEIVE_FETCH_SITE');
        expect(serverActionHandler.args[1][0].type).to.be.equal('RECEIVE_FETCH_SITE');
        expect(serverActionHandler.args[2][0].type).to.be.equal('receive_site_recommendations');
    });
});
