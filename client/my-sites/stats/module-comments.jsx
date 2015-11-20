/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:stats:module-comments' );

/**
 * Internal dependencies
 */
var toggle = require( './mixin-toggle' ),
	SelectDropdown = require( 'components/select-dropdown' ),
	StatsList = require( './stats-list' ),
	observe = require( 'lib/mixins/data-observe' ),
	ErrorPanel = require( './module-error' ),
	skeleton = require( './mixin-skeleton' ),
	analytics = require( 'analytics' ),
	Card = require( 'components/card' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'StatModuleComments',

	mixins: [ toggle('Comments'), skeleton('data'), observe( 'commentsList', 'commentFollowersList' ) ],

	data: function( nextProps ) {
		var props = nextProps || this.props;
		return props.commentsList.response.data.authors;
	},

	getInitialState: function() {
		return {
			activeFilter: 'top-authors',
			noData: this.props.commentsList.isEmpty( 'authors' )
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		this.setState( { noData: nextProps.commentsList.isEmpty( 'authors' ) } );
	},

	changeFilter: function( selection ) {
		var gaEvent,
			filter = selection.value;

		if( filter !== this.state.activeFilter ) {
			switch ( filter ) {
				case 'top-authors':
					gaEvent = 'Clicked By Authors Comments Toggle';
					break;
				case 'top-content':
					gaEvent = 'Clicked By Posts & Pages Comments Toggle';
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
			options= [
				{ value: 'top-authors', label: this.translate( 'Comments By Authors' ) },
				{ value: 'top-content', label: this.translate( 'Comments By Posts & Pages' ) }
			];

		selectFilter = (
			<div className="select-dropdown__wrapper">
				<SelectDropdown options={ options } onSelect={ this.changeFilter } />
			</div>
		);

		return selectFilter;
	},

	render: function() {
		var data = this.data(),
			commentsList = this.props.commentsList,
			hasError = this.props.commentsList.isError(),
			noData = this.props.commentsList.isEmpty( 'authors' ),
			infoIcon = this.state.showInfo ? 'info' : 'info-outline',
			classes,
			topCommenters,
			mostCommented,
			summary,
			moduleHeaderTitle,
			moduleToggle,
			commentFollowers,
			commentFollowURL,
			activeTab;

			activeTab = 'tab-' + this.state.activeFilter;

			classes = [
				'stats-module',
				activeTab,
				{
					'is-expanded': this.state.showModule,
					'is-loading': ! data,
					'is-showing-info': this.state.showInfo,
					'has-no-data': noData,
					'is-showing-error': hasError || noData
				}
			];

			debug( 'Rendering comments with data', classes );
			debug( 'data is', this.props.commentsList.data );

			if ( commentsList.response.data && commentsList.response.data.authors ) {
				topCommenters = <StatsList moduleName='Top Commenters' data={ commentsList.response.data.authors } followList={ this.props.followList } />;
			}

			if ( commentsList.response.data && commentsList.response.data.posts ) {
				mostCommented = <StatsList moduleName='Most Commented' data={ commentsList.response.data.posts } />;
			}

			if ( data && data.monthly_comments ) {
				summary = (
					<div className="module-content-text">
						<p>{ this.translate( 'Average comments per month:' ) } { this.numberFormat( data.monthly_comments ) }</p>
					</div>
				);
			}

			if ( !this.props.summary ) {
				moduleToggle = (
					<li className="module-header-action toggle-services">
						<a
							href="#"
							className="module-header-action-link"
							aria-label={
								this.translate(
									'Expand or collapse panel',
									{ context: 'Stats panel action' }
								)
							}
							title={
								this.translate(
									'Expand or collapse panel',
									{ context: 'Stats panel action' }
								)
							}
							onClick={
								this.toggleModule
							}
						>
							<Gridicon icon="chevron-down" />
						</a>
					</li>
				);
			}
			
			if ( this.props.commentFollowersList.response.data && this.props.commentFollowersList.response.data.total ) {
				commentFollowURL = '/stats/follows/comment/' + this.props.site.slug;
				commentFollowers = (
					<div className="module-content-text module-content-text-stat">
						<p>
							{ this.translate( 'Total posts with comment followers:' ) } <a href={ commentFollowURL }>{ this.numberFormat( this.props.commentFollowersList.response.data.total ) }</a>
						</p>
					</div>
				);
			}

			moduleHeaderTitle = (
				<h4 className="module-header-title">{ this.translate( 'Comments' ) }</h4>
			);

		return (
			<Card className={ classNames.apply( null, classes ) }>
				<div>
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
							<p>{ this.translate( 'If you allow comments on your site, track your top commenters and discover what content sparks the liveliest conversations, based on the most recent 1,000 comments.' ) }</p>
							<ul className="documentation">
								<li><a href="http://en.support.wordpress.com/enable-disable-comments/" target="_blank"><Gridicon icon="help-outline" /> { this.translate( 'How do I turn on/off comments?' ) }</a></li>
								<li><a href="http://en.support.wordpress.com/category/comments/" target="_blank"><Gridicon icon="folder" /> { this.translate( 'About Comments' ) }</a></li>
							</ul>
						</div>

						{ ( noData && ! hasError ) ? <ErrorPanel className='is-empty-message' message={ this.translate( 'No comments posted' ) } /> : null }

						{ this.filterSelect() }

						{ commentFollowers }

						{ hasError ? <ErrorPanel className='network-error' /> : null }

						<div className="tab-content top-authors stats-async-metabox-wrapper">
							<ul className="module-content-list module-content-list-legend">
								<li className="module-content-list-item">
									<span className="module-content-list-item-wrapper">
										<span className="module-content-list-item-right">
											<span className="module-content-list-item-value">{ this.translate( 'Comments' ) }</span>
										</span>
										<span className="module-content-list-item-label">{ this.translate( 'Author' ) }</span>
									</span>
								</li>
							</ul>
							{ topCommenters }
						</div>
						<div className="tab-content top-content stats-async-metabox-wrapper">
							<ul className="module-content-list module-content-list-legend">
								<li className="module-content-list-item">
									<span className="module-content-list-item-wrapper">
										<span className="module-content-list-item-right">
											<span className="module-content-list-item-value">{ this.translate( 'Comments' ) }</span>
										</span>
										<span className="module-content-list-item-label">{ this.translate( 'Title' ) }</span>
									</span>
								</li>
							</ul>
							{ mostCommented }
						</div>
						{ summary }
						<div className="module-placeholder is-void"></div>
					</div>
				</div>
			</Card>
		);
	}
} );
