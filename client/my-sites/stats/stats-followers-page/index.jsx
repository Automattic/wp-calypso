/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var StatsList = require( '../stats-list' ),
	StatsListLegend = require( '../stats-list/legend' ),
	StatsModuleSelectDropdown = require( '../stats-module/select-dropdown' ),
	StatsModulePlaceholder = require( '../stats-module/placeholder' ),
	ErrorPanel = require( '../stats-error' ),
	Pagination = require( '../pagination' ),
	analytics = require( 'lib/analytics' ),
	Card = require( 'components/card' ),
	SectionHeader = require( 'components/section-header' ),
	Button = require( 'components/button' );

module.exports = React.createClass( {
	displayName: 'StatModuleFollowersPage',

	data: function( nextProps ) {
		var props = nextProps || this.props;
		return props.followersList.response.data;
	},

	getInitialState: function() {
		return {
			activeFilter: 'wpcom-followers',
			noData: this.props.followersList.isEmpty( 'subscribers' )
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		this.setState( {
			noData: nextProps.followersList.isEmpty( 'subscribers' )
		} );
	},

	filterSelect: function() {
		var selectFilter,
			options = [
				{
					value: 'wpcom',
					label: this.translate( 'WordPress.com Followers' )
				},
				{
					value: 'email',
					label: this.translate( 'Email Followers' )
				}
			];

		if ( 'comment' !== this.props.followType ) {
			selectFilter = <StatsModuleSelectDropdown options={ options } onSelect={ this.props.changeFilter } />;
		}

		return selectFilter;
	},

	recordDownloadClick: function() {
		analytics.ga.recordEvent( 'Stats', 'Clicked Download Email Followers CSV link' );
	},

	render: function() {
		var data = this.data(),
			hasError = this.props.followersList.isError(),
			noData = this.props.followersList.isEmpty( 'subscribers' ),
			isLoading = this.props.followersList.isLoading(),
			followers,
			labelLegend,
			valueLegend,
			pagination,
			paginationSummary,
			startIndex,
			endIndex,
			emailExportUrl,
			itemType,
			classes;

		classes = [
			'stats-module',
			'summary',
			'is-followers-page',
			{
				'is-loading': isLoading,
				'has-no-data': noData,
				'is-showing-error': hasError || noData
			}
		];

		switch ( this.props.followType ) {
			case 'comment':
				itemType = this.translate( 'Comments' );
				break;

			case 'email':
				itemType = this.translate( 'Email' );
				break;

			case 'wpcom':
				itemType = this.translate( 'WordPress.com' );
				break;
		}

		if ( data.total ) {
			startIndex = this.props.perPage * ( this.props.page - 1 ) + 1;
			endIndex = this.props.perPage * this.props.page;

			if ( endIndex > data.total ) {
				endIndex = data.total;
			}

			paginationSummary = this.translate( 'Showing %(startIndex)s - %(endIndex)s of %(total)s %(itemType)s followers', {
				context: 'pagination',
				comment: '"Showing [start index] - [end index] of [total] [item]" Example: Showing 21 - 40 of 300 WordPress.com followers',
				args: {
					startIndex: this.numberFormat( startIndex ),
					endIndex: this.numberFormat( endIndex ),
					total: this.numberFormat( data.total ),
					itemType: itemType
				}
			} );

			paginationSummary = (
				<div className="module-content-text module-content-text-stat">
					<p>{ paginationSummary }</p>
				</div>
			);
		}

		pagination = <Pagination page={ this.props.page } perPage={ this.props.perPage } total={ data.total } pageClick={ this.props.pageClick } />;

		if ( data && data.posts ) {
			followers = <StatsList data={ data.posts } moduleName="Followers" />;
			labelLegend = this.translate( 'Post', {
				context: 'noun'
			} );
			valueLegend = this.translate( 'Followers' );
		} else if ( data && data.subscribers ) {
			followers = <StatsList data={ data.subscribers } followList={ this.props.followList } moduleName="Followers" />;
			labelLegend = this.translate( 'Follower' );
			valueLegend = this.translate( 'Since' );
		}

		if ( 'email' === this.props.followType ) {
			emailExportUrl = 'https://dashboard.wordpress.com/wp-admin/index.php?page=stats&blog=' + this.props.site.ID + '&blog_subscribers=csv&type=email';
		}

		return (
			<div className="followers">
				<SectionHeader label={ this.translate( 'Followers' ) }>
					{ emailExportUrl
						? ( <Button compact href={ emailExportUrl }>{ this.translate( 'Download Data as CSV' ) }</Button> )
						: null }
				</SectionHeader>
				<Card className={ classNames( classes ) }>
					<div className="module-content">
						{ this.filterSelect() }

						{ ( noData && ! hasError ) ? <ErrorPanel className="is-empty-message" message={ this.translate( 'No followers' ) } /> : null }

						{ paginationSummary }

						{ pagination }

						<StatsListLegend value={ valueLegend } label={ labelLegend } />

						{ followers }

						{ hasError ? <ErrorPanel className="network-error" /> : null }

						<StatsModulePlaceholder isLoading={ isLoading } />

						{ pagination }
					</div>
				</Card>
			</div>
		);
	}
} );
