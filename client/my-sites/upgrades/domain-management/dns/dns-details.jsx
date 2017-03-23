/**
 * External dependencies
 */
var React = require('react');

/**
 * Internal dependencies
 */
var support = require('lib/url/support');

var DnsDetails = React.createClass({
    render: function() {
        return (
            <p className="dns__details">
                {this.translate(
                    'DNS records are special settings that change how your domain works. They let you connect to third-party services, like an email provider. '
                )}
                <a href={support.CUSTOM_DNS}>
                    {this.translate('Learn more.')}
                </a>
            </p>
        );
    },
});

module.exports = DnsDetails;
