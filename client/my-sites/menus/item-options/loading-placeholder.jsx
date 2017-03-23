/**
 * External dependencies
 */
var React = require('react');

/**
 * Component
 */
var LoadingPlaceholder = React.createClass({
    render: function() {
        return (
            <li>
                <input className="placeholder-text" type="radio" name="radios" disabled={true} />
                <label><span className="placeholder-text">Loading list of options...</span></label>
            </li>
        );
    },
});

module.exports = LoadingPlaceholder;
