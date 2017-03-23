/**
 * External dependencies
 */
var expect = require('chai').expect, sinon = require('sinon');

/**
 * Internal dependencies
 */
var Pageable = require('../'), Emitter = require('lib/mixins/emitter');

function ItemList() {
    this.data = [];
    this.perPage = 1;
}

Pageable(ItemList.prototype);
Emitter(ItemList.prototype);

ItemList.prototype.fetch = function() {};
ItemList.prototype.parse = function(data) {
    return data.items;
};

describe('Pageable', function() {
    context('when mixed in with a collection', function() {
        before(function() {
            this.itemList = new ItemList();
            this.fetchStub = sinon.stub(this.itemList, 'fetch');
        });

        it('expects the data property to be set', function() {
            expect(this.itemList.data).to.be.an('array');
        });

        it('expects the perPage property to be set', function() {
            expect(this.itemList.perPage).to.be.a('number');
        });

        it('should mix in its own properties', function() {
            expect(this.itemList.fetchingNextPage).to.equal(false);
            expect(this.itemList.lastPage).to.equal(false);
            expect(this.itemList.errors).to.be.an('array');
            expect(this.itemList.page).to.equal(0);
        });

        describe('fetchNextPage', function() {
            before(function() {
                this.itemList.fetchNextPage();
            });

            it("should call the collection's fetch() method", function() {
                expect(this.fetchStub.calledOnce).to.be.true;
            });

            it('sets fetchingNextPage to true', function() {
                expect(this.itemList.fetchingNextPage).to.be.true;
            });

            it('passes an options object to fetch()', function() {
                expect(this.fetchStub.getCall(0).args[0]).to.be.a('object');
            });

            it('passes a callback to fetch()', function() {
                expect(this.fetchStub.getCall(0).args[1]).to.be.a('function');
            });

            it('increments the page', function() {
                expect(this.itemList.page).to.equal(1);
            });
        });

        describe('handleResponse() on page 1', function() {
            before(function() {
                var data = { found: 2, items: [{ id: 1, name: 'foo' }] };
                this.fetchCallback = this.fetchStub.getCall(0).args[1];
                this.itemList.handleResponse({ page: 1 }, this.fetchCallback, null, data);
            });

            it('sets fetchingNextPage to false', function() {
                expect(this.itemList.fetchingNextPage).to.be.false;
            });

            it('leaves the page number alone', function() {
                expect(this.itemList.page).to.equal(1);
            });
        });

        describe('handleResponse() on page 2', function() {
            before(function() {
                var data = { found: 2, items: [{ id: 2, name: 'bar' }] };
                this.itemList.fetchNextPage();
                this.fetchCallback = this.fetchStub.getCall(0).args[1];
                this.itemList.handleResponse({ page: 2 }, this.fetchCallback, null, data);
            });

            it('sets fetchingNextPage to false', function() {
                expect(this.itemList.fetchingNextPage).to.be.false;
            });

            it('leaves the page number alone', function() {
                expect(this.itemList.page).to.equal(2);
            });
        });

        describe('handleResponse() on page 3 (empty)', function() {
            before(function() {
                var data = { found: 2, items: [] };
                this.itemList.fetchNextPage();
                this.fetchCallback = this.fetchStub.getCall(0).args[1];
                this.itemList.handleResponse({ page: 3 }, this.fetchCallback, null, data);
            });

            it('sets fetchingNextPage to false', function() {
                expect(this.itemList.fetchingNextPage).to.be.false;
            });

            it('sets lastPage to true', function() {
                expect(this.itemList.lastPage).to.be.true;
            });
        });

        describe('handleResponse() with one page only', function() {
            before(function() {
                var data = { found: 1, items: [{ id: 1, name: 'foo' }] };
                this.itemList.handleResponse({ page: 1 }, sinon.stub(), null, data);
            });

            it('sets lastPage to true', function() {
                expect(this.itemList.lastPage).to.be.true;
            });
        });
    });
});
