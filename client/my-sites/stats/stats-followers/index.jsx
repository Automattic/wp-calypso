/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var StatsListLegend = require( '../stats-list/legend' ),
	StatsModuleSelectDropdown = require( '../stats-module/select-dropdown' ),
	StatsModulePlaceholder = require( '../stats-module/placeholder' ),
	StatsList = require( '../stats-list' ),
	observe = require( 'lib/mixins/data-observe' ),
	ErrorPanel = require( '../stats-error' ),
	analytics = require( 'lib/analytics' ),
	Card = require( 'components/card' ),
	SectionHeader = require( 'components/section-header' );

module.exports = React.createClass( {
	displayName: 'StatModuleFollowers',

	mixins: [ observe( 'wpcomFollowersList', 'emailFollowersList' ) ],

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
			selectFilter = <StatsModuleSelectDropdown options={ options } onSelect={ this.changeFilter } />;
		}

		return selectFilter;
	},

	render: function() {
		var wpcomData = this.data( 'wpcomFollowersList' ),
			emailData = this.data( 'emailFollowersList' ),
			noData = this.props.wpcomFollowersList.isEmpty( 'subscribers' ) && this.props.emailFollowersList.isEmpty( 'subscribers' ),
			hasError = ( this.props.wpcomFollowersList.isError() || this.props.emailFollowersList.isError() ),
			isLoading = this.props.wpcomFollowersList.isLoading() || this.props.emailFollowersList.isLoading(),
			wpcomFollowers,
			emailFollowers,
			wpcomTotalFollowers,
			emailTotalFollowers,
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
				'is-loading': isLoading,
				'has-no-data': noData,
				'is-showing-error': hasError || noData
			}
		];

		const summaryPageSlug = this.props.site ? this.props.site.slug : '';
		if ( 'email-followers' === activeFilter ) {
			summaryPageLink = '/stats/follows/email/' + summaryPageSlug;
		} else {
			summaryPageLink = '/stats/follows/wpcom/' + summaryPageSlug;
		}

		if ( wpcomData && wpcomData.subscribers ) {
			wpcomFollowers = <StatsList moduleName="wpcomFollowers" data={ wpcomData.subscribers } followList={ this.props.followList } />;
		}

		if ( emailData && emailData.subscribers ) {
			emailFollowers = <StatsList moduleName="EmailFollowers" data={ emailData.subscribers } />;
		}

		if ( wpcomData && wpcomData.total ) {
			wpcomTotalFollowers = <p>{ this.translate( 'Total WordPress.com Followers' ) }: { this.numberFormat( wpcomData.total ) }</p>;
		}

		if ( emailData && emailData.total ) {
			emailTotalFollowers = <p>{ this.translate( 'Total Email Followers' ) }: { this.numberFormat( emailData.total ) }</p>;
		}

		if ( ( wpcomData && wpcomData.viewAll ) || ( emailData && emailData.viewAll ) ) {
			viewSummary = (
				<div key="view-all" className="module-expand">
					<a href={ summaryPageLink }>{ this.translate( 'View All', { context: 'Stats: Button label to expand a panel' } ) }<span className="right"></span></a>
				</div>
				);
		}

		return (
			<div>
				<SectionHeader label={ this.translate( 'Followers' ) } href={ summaryPageLink } />
				<Card className={ classNames.apply( null, classes ) }>
					<div className="followers">
						<div className="module-content">
							{ noData && ! hasError ? <ErrorPanel className="is-empty-message" message={ this.translate( 'No followers' ) } /> : null }

							{ this.filterSelect() }

							<div className="tab-content wpcom-followers stats-async-metabox-wrapper">
								<div className="module-content-text module-content-text-stat">
									{ wpcomTotalFollowers }
								</div>
								<StatsListLegend value={ this.translate( 'Since' ) } label={ this.translate( 'Follower' ) } />
								{ wpcomFollowers }
								{ this.props.wpcomFollowersList.isError() ? <ErrorPanel className="is-error" /> : null }
							</div>

							<div className="tab-content email-followers stats-async-metabox-wrapper">
								<div className="module-content-text module-content-text-stat">
									{ emailTotalFollowers }
								</div>

								<StatsListLegend value={ this.translate( 'Since' ) } label={ this.translate( 'Follower' ) } />
								{ emailFollowers }
								{ this.props.emailFollowersList.isError() ? <ErrorPanel className={ 'network-error' } /> : null }
							</div>

							<StatsModulePlaceholder isLoading={ isLoading } />
						</div>
						{ viewSummary }
					</div>
				</Card>
			</div>
		);
	}
} );
