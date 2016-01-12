/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:stats:module-followers-page' );

/**
 * Internal dependencies
 */
var StatsList = require( '../stats-list' ),
	SelectDropdown = require( 'components/select-dropdown' ),
	toggle = require( '../mixin-toggle' ),
	skeleton = require( '../mixin-skeleton' ),
	ErrorPanel = require( '../stats-error' ),
	Pagination = require( '../pagination' ),
	analytics = require( 'analytics' ),
	Card = require( 'components/card' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'StatModuleFollowersPage',

	mixins: [ toggle( 'FollowersPage' ), skeleton( 'data' ) ],

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
			selectFilter = (
				<div className="select-dropdown__wrapper">
					<SelectDropdown options={ options } onSelect={ this.props.changeFilter } />
				</div>
			);
		}

		return selectFilter;
	},

	recordDownloadClick: function() {
		analytics.ga.recordEvent( 'Stats', 'Clicked Download Email Followers CSV link' );
	},

	render: function() {
		debug( 'Rendering stats followers page' );

		var data = this.data(),
			hasError = this.props.followersList.isError(),
			noData = this.props.followersList.isEmpty( 'subscribers' ),
			followers,
			moduleHeaderTitle,
			labelLegend,
			valueLegend,
			pagination,
			paginationSummary,
			startIndex,
			endIndex,
			emailExportUrl,
			emailExportLink,
			itemType,
			classes,
			infoIcon = this.state.showInfo ? 'info' : 'info-outline';

		classes = [
			'stats-module',
			'is-expanded',
			'summary',
			'is-followers-page',
			{
				'is-loading': this.props.followersList.isLoading(),
				'is-showing-info': this.state.showInfo,
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
			followers = <StatsList data={ data.posts } moduleName='Followers' />;
			labelLegend = this.translate( 'Post', {
				context: 'noun'
			} );
			valueLegend = this.translate( 'Followers' );
		} else if ( data && data.subscribers ) {
			followers = <StatsList data={ data.subscribers } followList={ this.props.followList } moduleName='Followers' />;
			labelLegend = this.translate( 'Follower' );
			valueLegend = this.translate( 'Since' );
		}

		moduleHeaderTitle = (
			<h4 className="module-header-title">{ this.translate( 'Followers' ) }</h4>
			);

		if ( 'email' === this.props.followType ) {
			emailExportUrl = 'https://dashboard.wordpress.com/wp-admin/index.php?page=stats&blog=' + this.props.site.ID + '&blog_subscribers=csv&type=email';

			emailExportLink = (
				<div className="module-content-text">
					<ul className="documentation">
						<li>
							<a href={ emailExportUrl } target="_blank" onClick={ this.recordDownloadClick }>
								<Gridicon icon="cloud-download" />
								{ this.translate( 'Download all email followers as CSV', { context: 'Action shown in stats followers module to download all email followers.' } ) }
							</a>
						</li>
					</ul>
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
								<a href="#" className="module-header-action-link" aria-label={ this.translate( 'Show or hide panel information', { textOnly: true, context: 'Stats panel action' } ) } title={ this.translate( 'Show or hide panel information', { textOnly: true, context: 'Stats panel action' } ) } onClick={ this.toggleInfo } >
									<Gridicon icon={ infoIcon } />
								</a>
							</li>
						</ul>
					</div>

					<div className="module-content">
						<div className="module-content-text module-content-text-info">
							<p>{ this.translate( 'Keep track of your overall number of followers, and how long each one has been following your site.' ) }</p>
							<ul className="documentation">
								<li><a href="http://en.support.wordpress.com/followers/" target="_blank"><Gridicon icon="folder" /> { this.translate( 'About Followers' ) }</a></li>
							</ul>
						</div>

						{ this.filterSelect() }

						{ ( noData && ! hasError ) ? <ErrorPanel className='is-empty-message' message={ this.translate( 'No followers' ) } /> : null }

						{ paginationSummary }

						{ pagination }

						<div className="stats-async-metabox-wrapper">
							<ul className="module-content-list module-content-list-legend">
								<li className="module-content-list-item">
									<span className="module-content-list-item-wrapper">
										<span className="module-content-list-item-right">
											<span className="module-content-list-item-value">{ valueLegend }</span>
										</span>
										<span className="module-content-list-item-label">{ labelLegend }</span>
									</span>
								</li>
							</ul>
							{ followers }
							{ hasError ? <ErrorPanel className={ 'network-error' } /> : null }
						</div>

						<div className="module-placeholder is-void"></div>

						{ pagination }

						{ emailExportLink }
					</div>
				</div>
			</Card>
		);
	}
} );
