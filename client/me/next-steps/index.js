/**
 * External dependencies
 */
var React = require( 'react' ),
	property = require( 'lodash/property' ),
	sortBy = require( 'lodash/sortBy' );

/**
 * Internal dependencies
 */
var NextStepsBox = require( './next-steps-box' ),
	MeSidebarNavigation = require( 'me/sidebar-navigation' ),
	observe = require( 'lib/mixins/data-observe' ),
	steps = require( './steps' ),
	analytics = require( 'lib/analytics' ),
	productsValues = require( 'lib/products-values' ),
	sites = require( 'lib/sites-list' )();

module.exports = React.createClass( {

	mixins: [ observe( 'trophiesData', 'sites' ) ],

	getDefaultProps: function() {
		return { sites: sites };
	},

	userState: {},

	componentWillUnmount: function() {
		window.scrollTo( 0, 0 );
	},

	recordEvent: function( event ) {
		analytics.ga.recordEvent( 'Me > Next > Welcome Message', event.action );
		analytics.tracks.recordEvent( 'calypso_me_next_welcome_click', {
			link: event.tracks,
			is_welcome: this.props.isWelcome
		} );
	},

	setUserStateFromTrophiesData: function() {
		this.userState = { userHasPosted: this.hasUserPosted() };
	},

	hasUserPosted: function() {
		if ( this.props.trophiesData.hasLoadedFromServer() ) {
			return this.props.trophiesData.get().trophies.some( function( trophy ) {
				return 'post-milestone' === trophy.type;
			} );
		}
	},

	// This can be used to update the copy of the steps depending on whether
	// the user has already done the action
	renderPostComponent: function() {
		if ( this.props.trophiesData.hasLoadedFromServer() ) {
			return (
				<div>
					{ this.userState.userHasPosted ? 'You have posted' : 'Create a post' }
				</div>
			);
		}
	},

	renderMeSidebar: function() {
		if ( ! this.props.isWelcome ) {
			return <MeSidebarNavigation />;
		}
	},

	bloggingUniversityLinkRecordEvent: function() {
		this.recordEvent( {
			tracks: 'blogging_course',
			action: 'Clicked Blogging University Link'
		} );
	},

	docsLinkRecordEvent: function() {
		this.recordEvent( {
			tracks: 'documentation',
			action: 'Clicked Documentation Link'
		} );
	},

	dismissLinkRecordEvent: function() {
		this.recordEvent( {
			tracks: 'dismiss',
			action: 'Clicked Dismiss Link'
		} );
	},

	introMessage: function() {
		if ( this.props.isWelcome ) {
			return (
				<div className="next-steps__intro">
				<h3 className="next-steps__title">{ this.translate( 'Thanks for signing up for WordPress.com.' ) }</h3>
				<p className="next-steps__intro">
					{ this.translate(
						'Next you can take any of the following steps, ' +
						'join a {{bloggingUniversityLink}}guided blogging course{{/bloggingUniversityLink}}, ' +
						'or check out our {{docsLink}}support documentation{{/docsLink}}.', {
							components: {
								bloggingUniversityLink: <a
									href="https://bloggingu.wordpress.com/"
									target="_blank"
									rel="noopener noreferrer"
									onClick={ this.bloggingUniversityLinkRecordEvent }
								/>,
								docsLink: <a
									href="http://en.support.wordpress.com/"
									target="_blank"
									rel="noopener noreferrer"
									onClick={ this.docsLinkRecordEvent }
								/>
							}
						}
					) }
				</p>
			</div>
			);
		}
	},

	newestSite: function() {
		return sortBy( this.props.sites.get(), property( 'ID' ) ).pop();
	},

	outroMessage: function() {
		var site,
			dismissLink;

		if ( this.props.isWelcome ) {
			site = this.newestSite();
			dismissLink = '/stats/insights/' + ( site ? site.slug : '' );

			return (
				<div className="next-steps__outro">
				<p>{
					this.translate( 'If you want you can {{a}}skip these steps{{/a}}. You can come back to this page any time.', {
						components: {
							a: <a href={ dismissLink } onClick={ this.dismissLinkRecordEvent } />
						}
					} )
				}</p>
			</div>
			);
		}
	},

	userHasPurchasedAPlan: function() {
		return this.props.sites.get().some( function( site ) {
			return productsValues.isPlan( site.plan );
		} );
	},

	renderSteps: function() {
		var site = this.newestSite(),
			sequence = steps.defaultSequence;

		if ( this.userHasPurchasedAPlan() ) {
			sequence = steps.hasPlanSequence;
		}

		return (
			<div className="next-steps__steps">
				{ sequence.map( function( stepName, index ) {
					var step = steps.definitions( site )[ stepName ];
					return <NextStepsBox key={ stepName } stepName={ stepName } step={ step } primary={ index === 0 } isWelcome={ this.props.isWelcome } />;
				}.bind( this ) ) }
			</div>
		);
	},

	render: function() {
		var classes = 'main main-column next-steps';

		this.setUserStateFromTrophiesData();

		if ( this.props.isWelcome ) {
			classes += ' is-single-page';
		}

		return (
			<div className={ classes }>
				{ this.renderMeSidebar() }

				{ this.introMessage() }

				{ this.renderSteps() }

				{ this.outroMessage() }
			</div>
		);
	}
} );
