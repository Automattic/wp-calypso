/**
 * External dependencies
 */
var React = require('react');

/**
 * Internal dependencies
 */
var PaginationPage = require('./pagination-page');

module.exports = React.createClass({
    displayName: 'StatModulePagination',

    propTypes: {
        page: React.PropTypes.number.isRequired,
        perPage: React.PropTypes.number.isRequired,
        total: React.PropTypes.number,
        pageClick: React.PropTypes.func.isRequired,
    },

    render: function() {
        var props = this.props,
            currentPage = props.page,
            pageList = [],
            perPage = props.perPage,
            total = props.total,
            pageCount = Math.ceil(total / perPage),
            pagination = null,
            i;

        if (pageCount > 1) {
            pageList = [
                1,
                currentPage - 2,
                currentPage - 1,
                currentPage,
                currentPage + 1,
                currentPage + 2,
                pageCount,
            ];
            pageList.sort(function(a, b) {
                return a - b;
            });

            // Remove pages less than 1, or greater than total number of pages, and remove duplicates
            pageList = pageList.filter(function(pageNumber, index, originalPageList) {
                return pageNumber >= 1 &&
                    pageNumber <= pageCount &&
                    originalPageList.lastIndexOf(pageNumber) === index;
            });

            for (i = pageList.length - 2; i >= 0; i--) {
                if (2 === pageList[i + 1] - pageList[i]) {
                    // Don't use ... if there's only 1 number being omitted, that's wasteful :)
                    pageList.splice(i + 1, 0, pageList[i + 1] - 1);
                } else if (pageList[i + 1] - pageList[i] > 1) {
                    pageList.splice(i + 1, 0, '...');
                }
            }

            // Arrows are always present, whether or not they are active is determined in the pagination page module
            pageList.unshift('-->');
            pageList.unshift('<--');

            pageList = pageList.map(
                function(pageNumber, index) {
                    return (
                        <PaginationPage
                            key={index}
                            pageNumber={pageNumber}
                            currentPage={currentPage}
                            totalPages={pageCount}
                            pageClick={this.props.pageClick}
                        />
                    );
                },
                this
            );
        }

        if (pageCount > 1) {
            pagination = (
                <div className="stats-pagination">
                    <ul className="stats-pagination__list">
                        {pageList}
                    </ul>
                </div>
            );
        } else {
            pagination = null;
        }

        return pagination;
    },
});
