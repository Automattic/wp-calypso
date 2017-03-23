/**
 * External dependencies
 */
const React = require('react');

/**
 * Internal dependencies
 */
const Card = require('components/card'), Search = require('components/search');

const SearchCard = React.createClass({
    propTypes: {
        additionalClasses: React.PropTypes.string,
        initialValue: React.PropTypes.string,
        placeholder: React.PropTypes.string,
        delaySearch: React.PropTypes.bool,
        onSearch: React.PropTypes.func.isRequired,
        onSearchChange: React.PropTypes.func,
        analyticsGroup: React.PropTypes.string,
        autoFocus: React.PropTypes.bool,
        disabled: React.PropTypes.bool,
        dir: React.PropTypes.string,
        maxLength: React.PropTypes.number,
    },

    render: function() {
        return (
            <Card className="search-card">
                <Search ref="search" {...this.props} />
            </Card>
        );
    },

    focus: function() {
        this.refs.search.focus();
    },

    clear: function() {
        this.refs.search.clear();
    },
});

module.exports = SearchCard;
