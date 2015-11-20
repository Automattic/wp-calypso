/**
 * External dependencies
 */
var React = require( 'react' );

var DnsDetails = React.createClass( {
	render: function() {
		var dnsSupportUrl = 'https://support.wordpress.com/domains/custom-dns/';

		return (
			<p className="dns__details">
				{ this.translate( 'DNS records are special settings that change how your domain works. They let you connect to third-party services, like an email provider. ' ) }
				<a href={ dnsSupportUrl }>
					{ this.translate( 'Learn more.' ) }
				</a>
			</p>
		);
	}
} );

module.exports = DnsDetails;
