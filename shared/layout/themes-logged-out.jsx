/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var  Masterbar = require( './masterbar' ),
//	NoticesList = require( 'notices/notices-list' ),
//	notices = require( 'notices' ),
//	title = require( 'lib/screen-title' ),
	sanitize = require( 'sanitize' );

var ThemesLoggedOutLayout = React.createClass( {
	getInitialState: function() {
		return {
			section: undefined
		};
	},

	getStylesheet: function() {
		var stylesheet = 'style.css';

		if ( this.props.isRTL ) {
			stylesheet = 'style-rtl.css';
		} else if ( 'development' === this.props.env || this.props.isDebug ) {
			stylesheet = 'style-debug.css';
		}

		return this.props.urls[ stylesheet ];
	},

	renderBadge: function() {
		return (
			<div className="environment-badge">
				<a href={ this.props.feedbackURL } title="Report an issue" target="_blank" className="bug-report" />
				<span className={ 'environment is-' + this.props.badge }>
					{ this.props.badge }
				</span>
			</div>
		);
	},

	render: function() {
		var scriptSuffix = ( 'development' === this.props.env || this.props.isDebug ) ? '' : '-min',
			sectionClass = 'wp' + ( this.state.section ? ' is-section-' + this.state.section : '' );

		return (
			<html lang={ this.props.lang }
				dir={ this.props.isRTL ? 'rtl' : 'ltr' }
				className={ this.props.isFluidWidth ? 'is-fluid-with' : null }>
				<head>
					<title>WordPress.com</title>
					<meta charSet="utf-8" />
					<meta httpEquiv="X-UA-Compatible" content="IE=Edge" />
					<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
					<meta name="fomat-detection" content="telephone=no" />
					<meta name="mobile-web-app-capable" content="yes" />
					<link rel="shortcut icon" type="image/vnd.microsoft.icon" href={ this.props.faviconURL } sizes="16x16 32x32 48x48" />
					<link rel="shortcut icon" type="image/x-icon" href={ this.props.faviconURL } sizes="16x16" />
					<link rel="icon" type="image/x-icon" href={ this.props.faviconURL } sizes="16x16" />
					<link rel="profile" href="http://gmpg.org/xfn/11" />
					<link rel="stylesheet" href="//fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,400,300,600|Merriweather:700,400,700italic,400italic" />
					<link rel="stylesheet" href="//s1.wp.com/i/noticons/noticons.css?v=20150727" />
					<link rel="stylesheet" href="//s1.wp.com/wp-includes/css/dashicons.css?v=20150727" />
					<link rel="stylesheet" href={ this.getStylesheet() } />
				</head>
				<body className={ this.props.isRTL ? 'rtl' : null }>
					<div id="wpcom" className="wpcom-site">
						<div className={ sectionClass }>
							<Masterbar />
							<div id="content" className="wp-content">
								{ false && <NoticesList id="notices" notices={ notices.list } /> }
								<div id="primary" className="wp-primary wp-section">
									{ this.props.primary }
								</div>
							</div>
							<div id="tertiary" className="wp-overlay fade-background">
								{ this.props.tertiary }
							</div>
						</div>
					</div>
					{ this.props.badge ? this.renderBadge() : null }

					{ this.props.user &&
						<script type="text/javascript"
							dangerouslySetInnerHTML={ { __html:
								'var currentUser = ' + sanitize.jsonStringifyForHtml( this.props.user )
							} } />
					}
					{ this.props.app &&
						<script type="text/javascript"
							dangerouslySetInnerHTML={ { __html:
								'var app = ' + sanitize.jsonStringifyForHtml( this.props.app )
							} } />
					}
					{ this.props.i18nLocaleScript &&
						<script src={ this.props.i18nLocaleScript } />
					}
					<script src={ this.props.urls[ 'vendor' + scriptSuffix ] } />
					<script src={ this.props.urls[ this.props.jsFile + '-' + this.props.env + scriptSuffix ] } />
					{ this.props.chunk &&
						<script src={ this.props.urls[ this.props.chunk + scriptSuffix ] } />
					}
					<script type="text/javascript" dangerouslySetInnerHTML={ { __html: 'window.AppBoot();' } } />
				</body>
			</html>
		);
	}
} );

module.exports = ThemesLoggedOutLayout;
