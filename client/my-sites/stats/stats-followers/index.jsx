/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:stats:module-followers' );

/**
 * Internal dependencies
 */
var toggle = require( '../mixin-toggle' ),
	SelectDropdown = require( 'components/select-dropdown' ),
	StatsList = require( '../stats-list' ),
	observe = require( 'lib/mixins/data-observe' ),
	ErrorPanel = require( '../stats-error' ),
	skeleton = require( '../mixin-skeleton' ),
	analytics = require( 'analytics' ),
	Card = require( 'components/card' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'StatModuleFollowers',

	mixins: [ toggle( 'Followers' ), skeleton( 'data' ), observe( 'wpcomFollowersList', 'emailFollowersList' ) ],

	data: function( list ) {
		if ( list && this.props[ list ] ) {
			return this.props[ list ].response.data;
		}
	},

	getInitialState: function() {
		return {
			activeFilter: 'wpcom-followers',
			noData: ( this.props.wpcomFollowersList.isEmpty( 'subscribers' ) && this.props.emailFollowersList.isEmpty( 'subscribers' ) )
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		this.setState( {
			noData: ( nextProps.wpcomFollowersList.isEmpty( 'subscribers' ) && nextProps.emailFollowersList.isEmpty( 'subscribers' ) )
		} );
	},

	changeFilter: function( selection ) {
		var gaEvent,
			filter = selection.value;

		if ( filter !== this.state.activeFilter ) {
			switch ( filter ) {
			case 'wpcom-followers':
				gaEvent = 'Clicked By WordPress.com Followers Toggle';
				break;
			case 'email-followers':
				gaEvent = 'Clicked Email Followers Toggle';
				break;
			}

			if ( gaEvent ) {
				analytics.ga.recordEvent( 'Stats', gaEvent );
			}

			this.setState( {
				activeFilter: filter
			} );
		}
	},

	filterSelect: function() {
		var selectFilter,
			options = [
				{
					value: 'wpcom-followers',
					label: this.translate( 'WordPress.com Followers' )
				},
				{
					value: 'email-followers',
					label: this.translate( 'Email Followers' )
				}
			];

		if ( ( ! this.props.wpcomFollowersList.isEmpty( 'subscribers' ) ) && ( ! this.props.emailFollowersList.isEmpty( 'subscribers' ) ) ) {
			selectFilter = (
				<div className="select-dropdown__wrapper">
					<SelectDropdown options={ options } onSelect={ this.changeFilter } />
				</div>
			);
		}

		return selectFilter;
	},

	render: function() {
		debug( 'Rendering stats followers module' );

		var wpcomData = this.data( 'wpcomFollowersList' ),
			emailData = this.data( 'emailFollowersList' ),
			noData = this.props.wpcomFollowersList.isEmpty( 'subscribers' ) && this.props.emailFollowersList.isEmpty( 'subscribers' ),
			hasError = ( this.props.wpcomFollowersList.isError() || this.props.emailFollowersList.isError() ),
			infoIcon = this.state.showInfo ? 'info' : 'info-outline',
			wpcomFollowers,
			emailFollowers,
			wpcomTotalFollowers,
			emailTotalFollowers,
			moduleHeaderTitle,
			moduleToggle,
			summaryPageLink,
			viewSummary,
			activeFilter,
			activeFilterClass,
			classes;

		activeFilter = this.state.activeFilter;
		if ( this.props.wpcomFollowersList.isEmpty( 'subscribers' ) ) {
			activeFilter = 'email-followers';
		}

		activeFilterClass = 'tab-' + activeFilter;

		classes = [
			'stats-module',
			'is-followers',
			activeFilterClass,
			{
				'is-expanded': this.state.showModule,
				'is-loading': this.props.wpcomFollowersList.isLoading() || this.props.emailFollowersList.isLoading(),
				'is-showing-info': this.state.showInfo,
				'has-no-data': noData,
				'is-showing-error': hasError || noData
			}
		];

		if ( 'email-followers' === activeFilter ) {
			summaryPageLink = '/stats/follows/email/' + this.props.site.slug;
		} else {
			summaryPageLink = '/stats/follows/wpcom/' + this.props.site.slug;
		}

		if ( wpcomData && wpcomData.subscribers ) {
			wpcomFollowers = <StatsList moduleName='wpcomFollowers' data={ wpcomData.subscribers } followList={ this.props.followList } />;
		}

		if ( emailData && emailData.subscribers ) {
			emailFollowers = <StatsList moduleName='EmailFollowers' data={ emailData.subscribers } />;
		}

		if ( wpcomData && wpcomData.total ) {
			wpcomTotalFollowers = <p>{ this.translate( 'Total WordPress.com Followers' ) }: { this.numberFormat( wpcomData.total ) }</p>;
		}

		if ( emailData && emailData.total ) {
			emailTotalFollowers = <p>{ this.translate( 'Total Email Followers' ) }: { this.numberFormat( emailData.total ) }</p>;
		}

		if ( ! this.props.summary ) {
			moduleToggle = (
				<li className="module-header-action toggle-services">
					<a href="#" className="module-header-action-link" aria-label={ this.translate( 'Expand or collapse panel', { context: 'Stats panel action' } ) } title={ this.translate( 'Expand or collapse panel', { context: 'Stats panel action' } ) } onClick={ this.toggleModule }>
						<Gridicon icon="chevron-down" />
					</a>
				</li>
				);
		}

		moduleHeaderTitle = (
			<h4 className="module-header-title"><a href={ summaryPageLink }>{ this.translate( 'Followers' ) }</a></h4>
			);

		if ( ( wpcomData && wpcomData.viewAll ) || ( emailData && emailData.viewAll ) ) {
			viewSummary = (
				<div key='view-all' className='module-expand'>
					<a href={ summaryPageLink }>{ this.translate( 'View All', { context: 'Stats: Button label to expand a panel' } ) }<span className="right"></span></a>
				</div>
				);
		}

		return (
			<Card className={ classNames.apply( null, classes ) }>
				<div className="followers">
					<div className="module-header">
						{ moduleHeaderTitle }
						<ul className="module-header-actions">
							<li className="module-header-action toggle-info">
								<a href="#" className="module-header-action-link" aria-label={ this.translate( 'Show or hide panel information', { context: 'Stats panel action' } ) } title={ this.translate( 'Show or hide panel information', { context: 'Stats panel action' } ) } onClick={ this.toggleInfo } >
									<Gridicon icon={ infoIcon } />
								</a>
							</li>
							{ moduleToggle }
						</ul>
					</div>

					<div className="module-content">
						<div className="module-content-text module-content-text-info">
							<p>{ this.translate( 'Keep track of your overall number of followers, and how long each one has been following your site.' ) }</p>
							<ul className="documentation">
								<li><a href="http://en.support.wordpress.com/followers/" target="_blank"><Gridicon icon="folder" /> { this.translate( 'About Followers' ) }</a></li>
							</ul>
						</div>

						{ noData && ! hasError ? <ErrorPanel className='is-empty-message' message={ this.translate( 'No followers' ) } /> : null }

						{ this.filterSelect() }

						<div className="tab-content wpcom-followers stats-async-metabox-wrapper">
							<div className="module-content-text module-content-text-stat">
								{ wpcomTotalFollowers }
							</div>

							<ul className="module-content-list module-content-list-legend">
								<li className="module-content-list-item">
									<span className="module-content-list-item-wrapper">
										<span className="module-content-list-item-right">
											<span className="module-content-list-item-value">{ this.translate( 'Since' ) }</span>
										</span>
										<span className="module-content-list-item-label">{ this.translate( 'Follower' ) }</span>
									</span>
								</li>
							</ul>
							{ wpcomFollowers }
							{ this.props.wpcomFollowersList.isError() ? <ErrorPanel className="is-error" /> : null }
						</div>

						<div className="tab-content email-followers stats-async-metabox-wrapper">
							<div className="module-content-text module-content-text-stat">
								{ emailTotalFollowers }
							</div>

							<ul className="module-content-list module-content-list-legend">
								<li className="module-content-list-item">
									<span className="module-content-list-item-wrapper">
										<span className="module-content-list-item-right">
											<span className="module-content-list-item-value">{ this.translate( 'Since' ) }</span>
										</span>
										<span className="module-content-list-item-label">{ this.translate( 'Follower' ) }</span>
									</span>
								</li>
							</ul>
							{ emailFollowers }
							{ this.props.emailFollowersList.isError() ? <ErrorPanel className={ 'network-error' } /> : null }
						</div>

						<div className="module-placeholder is-void"></div>
					</div>
					{ viewSummary }
				</div>
			</Card>
		);
	}
} );
