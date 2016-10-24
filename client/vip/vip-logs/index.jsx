/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:vip:logs' );

/**
 * Internal dependencies
 */
var Main = require( 'components/main' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	SectionNav = require( 'components/section-nav' ),
	NavTabs = require( 'components/section-nav/tabs' ),
	NavItem = require( 'components/section-nav/item' ),
	Search = require( 'components/search' ),
	URLSearch = require( 'lib/mixins/url-search' ),
	LogsTable = require( './logs-table' ),
	config = require( 'config' );

module.exports = React.createClass( {
	displayName: 'vipLogs',
	mixins: [ URLSearch ],

	componentWillMount: function() {
		debug( 'Mounting VIP Logs React component.' );
	},

	getDefaultProps: function() {
		return {
			perPage: 20,
			logs: [
				{
					timestamp: '2015-04-04T17:28:58.000Z',
					log: 'Cannot redeclare admin_init() (previously declared in /home/website/public_html/runtime.php:14) in /home/website/public_html/runtime.php on line 26',
					type: 'error'
				},
				{
					timestamp: '2015-03-04T17:28:58.000Z',
					log: 'Call to undefined function wp_function() in /home/website/public_html/test.php on line 230',
					type: 'error'
				},
				{
					timestamp: '2015-02-04T17:28:58.000Z',
					log: 'Trying to get property of non-object in /var/www/www/website/libs/default.class.php on line 830',
					type: 'notice'
				},
				{
					timestamp: '2015-01-04T17:28:58.000Z',
					log: 'Creating default object from empty value in /var/www/www/website/libs/Hooks.class.php on line 264" while reading response header from upstream, client: 1XX.XX.XXX.XXX, server: mydomain.changeip.org, request: "GET /website/ HTTP/1.1", upstream: "fastcgi://unix:/run/php5-fpm.sock:", host: "mydomain.changeip.org"',
					type: 'warning'
				},
				{
					timestamp: '2015-01-03T17:28:58.000Z',
					log: 'Trying to get property of non-object in /var/www/www/pastebin/libs/default.class.php on line 850',
					type: 'notice'
				},
				{
					timestamp: '2015-01-03T17:25:58.000Z',
					log: 'Call to undefined function my_function() in /home/website/public_html/test.php on line 2',
					type: 'error'
				},
				{
					timestamp: '2015-01-03T17:22:58.000Z',
					log: 'Allowed memory size of 67108864 bytes exhausted (tried to allocate 17472 bytes) in /home/website/public_html/lib/Image.class.php on line 198',
					type: 'error'
				},
				{
					timestamp: '2015-04-04T17:28:58.000Z',
					log: 'Cannot redeclare admin_init() (previously declared in /home/website/public_html/runtime.php:14) in /home/website/public_html/runtime.php on line 26',
					type: 'error'
				},
				{
					timestamp: '2015-03-04T17:28:58.000Z',
					log: 'Call to undefined function wp_function() in /home/website/public_html/test.php on line 230',
					type: 'error'
				},
				{
					timestamp: '2015-02-04T17:28:58.000Z',
					log: 'Trying to get property of non-object in /var/www/www/website/libs/default.class.php on line 830',
					type: 'notice'
				},
				{
					timestamp: '2015-01-04T17:28:58.000Z',
					log: 'Creating default object from empty value in /var/www/www/website/libs/Hooks.class.php on line 264" while reading response header from upstream, client: 1XX.XX.XXX.XXX, server: mydomain.changeip.org, request: "GET /website/ HTTP/1.1", upstream: "fastcgi://unix:/run/php5-fpm.sock:", host: "mydomain.changeip.org"',
					type: 'warning'
				},
				{
					timestamp: '2015-01-03T17:28:58.000Z',
					log: 'Trying to get property of non-object in /var/www/www/pastebin/libs/default.class.php on line 850',
					type: 'notice'
				},
				{
					timestamp: '2015-01-03T17:25:58.000Z',
					log: 'Call to undefined function my_function() in /home/website/public_html/test.php on line 2',
					type: 'error'
				},
				{
					timestamp: '2015-01-03T17:22:58.000Z',
					log: 'Allowed memory size of 67108864 bytes exhausted (tried to allocate 17472 bytes) in /home/website/public_html/lib/Image.class.php on line 198',
					type: 'error'
				},
				{
					timestamp: '2015-04-04T17:28:58.000Z',
					log: 'Cannot redeclare admin_init() (previously declared in /home/website/public_html/runtime.php:14) in /home/website/public_html/runtime.php on line 26',
					type: 'error'
				},
				{
					timestamp: '2015-03-04T17:28:58.000Z',
					log: 'Call to undefined function wp_function() in /home/website/public_html/test.php on line 230',
					type: 'error'
				},
				{
					timestamp: '2015-02-04T17:28:58.000Z',
					log: 'Trying to get property of non-object in /var/www/www/website/libs/default.class.php on line 830',
					type: 'notice'
				},
				{
					timestamp: '2015-01-04T17:28:58.000Z',
					log: 'Creating default object from empty value in /var/www/www/website/libs/Hooks.class.php on line 264" while reading response header from upstream, client: 1XX.XX.XXX.XXX, server: mydomain.changeip.org, request: "GET /website/ HTTP/1.1", upstream: "fastcgi://unix:/run/php5-fpm.sock:", host: "mydomain.changeip.org"',
					type: 'warning'
				},
				{
					timestamp: '2015-01-03T17:28:58.000Z',
					log: 'Trying to get property of non-object in /var/www/www/pastebin/libs/default.class.php on line 850',
					type: 'notice'
				},
				{
					timestamp: '2015-01-03T17:25:58.000Z',
					log: 'Call to undefined function my_function() in /home/website/public_html/test.php on line 2',
					type: 'error'
				},
				{
					timestamp: '2015-01-03T17:22:58.000Z',
					log: 'Allowed memory size of 67108864 bytes exhausted (tried to allocate 17472 bytes) in /home/website/public_html/lib/Image.class.php on line 198',
					type: 'error'
				},
			]
		};
	},

	render: function() {
		var siteFilter = this.props.sites.selected ? '/' + this.props.sites.selected : '',
			statusSlug = this.props.status,
			searchPlaceholder, selectedText, filterStrings;

		if ( ! config.isEnabled( 'vip/logs' ) ) {
			return;
		}

		filterStrings = {
			all: this.translate( 'All', { context: 'Filter label for PHP logs' } ),
			error: this.translate( 'Error', { context: 'Filter label for PHP logs' } ),
			warning: this.translate( 'Warning', { context: 'Filter label for PHP logs' } ),
			notice: this.translate( 'Notice', { context: 'Filter label for PHP logs' } )
		};

		switch ( statusSlug ) {
			case 'error':
				searchPlaceholder = this.translate( 'Search error logs…', { context: 'Search placeholder for PHP logs' } );
				selectedText = filterStrings.error;
				break;
			case 'warning':
				searchPlaceholder = this.translate( 'Search warning logs…', { context: 'Search placeholder for PHP logs' } );
				selectedText = filterStrings.warning;
				break;
			case 'notice':
				searchPlaceholder = this.translate( 'Search notice logs…', { context: 'Search placeholder for PHP logs' } );
				selectedText = filterStrings.notice;
				break;
			default:
				searchPlaceholder = this.translate( 'Search logs…', { context: 'Search placeholder for PHP logs' } );
				selectedText = filterStrings.all;
				break;
		}

		return (
			<Main className="vip-logs">

				<SidebarNavigation />

				<SectionNav selectedText={ selectedText }>
					<NavTabs label={ filterStrings.status }>
						<NavItem path={ '/vip/logs' + siteFilter } selected={ ! statusSlug }>{ filterStrings.all }</NavItem>
						<NavItem path={ '/vip/logs/error' + siteFilter } selected={ statusSlug === 'error' } >{ filterStrings.error }</NavItem>
						<NavItem path={ '/vip/logs/warning' + siteFilter } selected={ statusSlug === 'warning' } >{ filterStrings.warning }</NavItem>
						<NavItem path={ '/vip/logs/notice' + siteFilter } selected={ statusSlug === 'notice' } >{ filterStrings.notice }</NavItem>
					</NavTabs>
					<Search
						pinned
						fitsContainer
						onSearch={ this.doSearch }
						initialValue={ this.props.search }
						placeholder={ searchPlaceholder }
						analyticsGroup="VIP Logs"
					/>
				</SectionNav>

				<LogsTable { ...this.props } />

			</Main>
		);
	}
} );
