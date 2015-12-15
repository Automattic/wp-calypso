/**
 * External dependencies
 */
const assign = require( 'lodash/object/assign' ),
	classnames = require( 'classnames' ),
	closest = require( 'component-closest' ),
	debug = require( 'debug' )( 'calypso:reader:sidebar' ),
	map = require( 'lodash/collection/map' ),
	some = require( 'lodash/collection/some' ),
	startsWith = require( 'lodash/string/startsWith' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	page = require( 'page' ),
	url = require( 'url' );

/**
 * Internal Dependencies
 */
const layoutFocus = require( 'lib/layout-focus' ),
	Tags = require( 'lib/reader-tags/subscriptions' ),
	TagActions = require( 'lib/reader-tags/actions' ),
	ReaderLists = require( 'lib/reader-lists/subscriptions' ),
	ListStore = require( 'lib/reader-lists/lists' ),
	ReaderListActions = require( 'lib/reader-lists/actions' ),
	ReaderTeams = require( 'lib/reader-teams' ),
	SidebarActions = require( 'lib/reader-sidebar/actions' ),
	stats = require( 'reader/stats' ),
	Gridicon = require( 'components/gridicon' ),
	config = require( 'config' ),
	discoverHelper = require( 'reader/discover/helper' );

module.exports = React.createClass( {
	displayName: 'ReaderSidebar',

	componentWillMount: function() {
		debug( 'Mounting the reader sidebar React component.' );
	},

	itemLinkClass: function( path, additionalClasses ) {
		var basePathLowerCase = this.props.path.split( '?' )[0].replace( /\/edit$/, '' ).toLowerCase(),
			pathLowerCase = path.replace( /\/edit$/, '' ).toLowerCase(),
			selected = basePathLowerCase === pathLowerCase,
			isActionButtonSelected = false;

		// Following is a special case, because it can be at / or /following
		if ( pathLowerCase === '/' && ! selected ) {
			selected = '/following' === basePathLowerCase;
		};

		// Are we on an edit page?
		const pathWithoutQueryString = this.props.path.split( '?' )[0];
		if ( selected && !! pathWithoutQueryString.match( /\/edit$/ ) ) {
			isActionButtonSelected = true;
		}

		return classnames( assign( { selected: selected, 'is-action-button-selected': isActionButtonSelected }, additionalClasses ) );
	},

	itemLinkClassStartsWithOneOf: function( paths, additionalClasses ) {
		const selected = this.pathStartsWithOneOf( paths );
		return classnames( assign( { selected }, additionalClasses ) );
	},

	pathStartsWithOneOf: function( paths ) {
		return some( paths, function( path ) {
			return startsWith( this.props.path.toLowerCase(), path.toLowerCase() )
		}, this );
	},

	handleClick: function( event ) {
		if ( ! event.isDefaultPrevented() && ! closest( event.target, 'input,textarea', true ) ) {
			layoutFocus.setNext( 'content' );
			window.scrollTo( 0, 0 );
		}
	},

	componentDidMount: function() {
		Tags.on( 'change', this.updateState );
		Tags.on( 'add', this.highlightNewTag );
		ReaderLists.on( 'change', this.updateState );
		ReaderLists.on( 'create', this.highlightNewList );
		ReaderTeams.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		Tags.off( 'change', this.updateState );
		Tags.off( 'add', this.highlightNewTag );
		ReaderLists.off( 'change', this.updateState );
		ReaderLists.off( 'create', this.highlightNewList );
		ReaderTeams.off( 'change', this.updateState );
	},

	getInitialState: function() {
		return this.getStateFromStores();
	},

	getStateFromStores: function() {
		var tags = Tags.get(),
			lists = ReaderLists.get(),
			teams = ReaderTeams.get();

		if ( ! ( tags && lists && teams ) ) {
			SidebarActions.fetch();
		}

		return {
			tags,
			lists,
			teams
		};
	},

	updateState: function() {
		this.setState( this.getStateFromStores() );
	},

	followTag: function( event ) {
		var tag, subscription;
		event.preventDefault();
		tag = ReactDom.findDOMNode( this.refs.addTagInput ).value;
		subscription = Tags.getSubscription( TagActions.slugify( tag ) );
		if ( subscription ) {
			this.highlightNewTag( subscription );
		} else {
			TagActions.follow( tag );
			stats.recordAction( 'followed_topic' );
			stats.recordGaEvent( 'Clicked Follow Topic', tag );
			stats.recordTrack( 'calypso_reader_reader_tag_followed' )
		}
	},

	unfollowTag: function( event ) {
		var node = closest( event.target, '[data-tag-slug]', true );
		event.preventDefault();
		if ( node && node.dataset.tagSlug ) {
			stats.recordAction( 'unfollowed_topic' );
			stats.recordGaEvent( 'Clicked Unfollow Topic', node.dataset.tagSlug );
			TagActions.unfollow( { slug: node.dataset.tagSlug } );
		}
	},

	highlightNewList: function( list ) {
		list = ListStore.get( list.owner, list.slug );
		window.location.href = url.resolve( 'https://wordpress.com', url.resolve( list.URL, 'edit' ) );
		ReactDom.findDOMNode( this.refs.addListInput ).value = '';
	},

	highlightNewTag: function( tag ) {
		process.nextTick( function() {
			page( '/tag/' + tag.slug );
			window.scrollTo( 0, 0 );
		} );
		ReactDom.findDOMNode( this.refs.addTagInput ).value = '';
	},

	createList: function( event ) {
		event.preventDefault();

		stats.recordAction( 'add_list' );
		stats.recordGaEvent( 'Clicked Create List' );

		ReaderListActions.create( ReactDom.findDOMNode( this.refs.addListInput ).value );
	},

	handleCreateListKeyDown: function( event ) {
		// Submit when enter key is pressed
		if ( event.keyCode === 13 ) {
			this.createList( event );
		}
	},

	handleFollowTagKeyDown: function( event ) {
		// Submit when enter key is pressed
		if ( event.keyCode === 13 ) {
			this.followTag( event );
		}
	},

	renderLists: function() {
		if ( ! this.state.lists ) {
			return null;
		}

		return map( this.state.lists, function( list ) {
			const listRelativeUrl = `/read/list/${ list.owner }/${ list.slug }`;
			let listManageUrl = `https://wordpress.com${ listRelativeUrl }/edit`;
			let listRel = 'external';

			if ( config.isEnabled( 'reader/list-management' ) ) {
				listManageUrl = `${ listRelativeUrl }/edit`;
				listRel = '';
			}

			const listManagementUrls = [
				listRelativeUrl + '/followers',
				listRelativeUrl + '/edit',
				listRelativeUrl + '/description/edit',
			];

			const classes = classnames(
				this.itemLinkClassStartsWithOneOf( [ listRelativeUrl ], { 'sidebar-dynamic-menu__list has-buttons': true } ),
				{
					'is-action-button-selected': this.pathStartsWithOneOf( listManagementUrls )
				}
			);

			return (
				<li className={ classes } key={ list.ID } >
					<a href={ list.URL }><span className="menu-link-text">{ list.title }</span></a>
					{ list.is_owner ? <a href={ listManageUrl } rel={ listRel } className="add-new">{ this.translate( 'Manage' ) }</a> : null }
				</li>
			);
		}, this );
	},

	renderTags: function() {
		if ( ! this.state.tags ) {
			return null;
		}

		return map( this.state.tags, function( tag ) {
			return (
				<li className={ this.itemLinkClass( '/tag/' + tag.slug, { 'sidebar-dynamic-menu__tag': true } ) } key={ tag.ID } >
					<a href={ tag.URL }>
						{ tag.title || tag.slug }
					</a>
					{ tag.ID !== 'pending' ? <button className="sidebar-dynamic-menu__action" data-tag-slug={ tag.slug } onClick={ this.unfollowTag }>
						<Gridicon icon="cross" size={ 24 } />
						<span className="sidebar-dynamic-menu__action-label">{ this.translate( 'Unfollow' ) }</span>
					</button> : null }
				</li>
			);
		}, this );
	},

	renderTeams: function() {
		if ( ! this.state.teams ) {
			return null;
		}

		return map( this.state.teams, function( team ) {
			var teamUri = '/read/' + encodeURIComponent( team.slug );
			return (
				<li className={ this.itemLinkClass( teamUri, { 'sidebar-streams__team': true } ) } key={ team.slug }>
					<a href={ teamUri }>
						<svg className={ 'menu-link-icon gridicon gridicon-' + team.slug } width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M7.99 1.57C3.75 1.57 1 4.57 1 7.8v0.4c0 3.18 2.75 6.24 6.99 6.24 4.26 0 7.01-3.05 7.01-6.24V7.8C15 4.57 12.25 1.57 7.99 1.57zM12.74 8.13c0 2.32-1.69 4.42-4.74 4.42 -3.05 0-4.73-2.1-4.73-4.42V7.84c0-2.32 1.67-4.38 4.73-4.38 3.06 0 4.75 2.07 4.75 4.39V8.13z" /><path d="M9.47 5.73C9.07 5.47 8.52 5.59 8.26 6L6.21 9.17c-0.26 0.41-0.15 0.95 0.26 1.21 0.4 0.26 0.95 0.14 1.21-0.26l2.05-3.17C9.99 6.53 9.88 5.99 9.47 5.73z" /></svg>
						<span className="menu-link-text">{ team.title }</span>
					</a>
				</li>
			);
		}, this );
	},

	getFollowingEditLink: function() {
		var followingEditUrl = '/following/edit',
			followingEditRel;

		// If Calypso following/edit isn't yet enabled, use the Atlas version
		if ( ! config.isEnabled( 'reader/following-edit' ) ) {
			followingEditUrl = 'https://wordpress.com'.concat( followingEditUrl );
			followingEditRel = 'external';
		}

		return {
			url: followingEditUrl,
			rel: followingEditRel
		};
	},

	render: function() {
		let followingEditLink = this.getFollowingEditLink();

		return (
			<ul className="wpcom-sidebar sidebar reader-sidebar" onClick={ this.handleClick }>
				<li className="sidebar-menu sidebar-streams">
					<h2 className="sidebar-heading">{ this.translate( 'Streams' ) }</h2>
					<ul>
						<li className={ this.itemLinkClass( '/', { 'sidebar-streams__following': true } ) }>
							<a href="/">
								<Gridicon icon="checkmark-circle" size={ 24 } />
								<span className="menu-link-text">{ this.translate( 'Followed Sites' ) }</span>
							</a>
							<a href={ followingEditLink.url } rel={ followingEditLink.rel } className="add-new">{ this.translate( 'Manage' ) }</a>
						</li>

						{ this.renderTeams() }

						{
							discoverHelper.isEnabled()
							? (
									<li className={ this.itemLinkClass( '/discover', { 'sidebar-streams__discover': true } ) }>
										<a href="/discover">
											<Gridicon icon="my-sites" />
											<span className="menu-link-text">{ this.translate( 'Discover' ) }</span>
										</a>
									</li>
								) : null
						}

						{
							config.isEnabled( 'reader/recommendations' )
							? ( <li className={ this.itemLinkClassStartsWithOneOf( [ '/recommendations', '/tags' ], { 'sidebar-streams__recommendations': true } ) }>
								<a href="/recommendations">
									<svg className="gridicon menu-link-icon" version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 24 24"><g><path d="M7.189,12.664l0.624-0.046l0.557-0.409l0.801-1.115l0.578-1.228l0.357-0.91l0.223-0.523l0.267-0.432 l0.49-0.409l0.578-0.5l0.445-0.682l0.267-1.046l0.29-1.934V3.159L12.931,3l0.467,0.046l0.534,0.227l0.49,0.363L14.8,4.25 l0.177,0.75V5.66l-0.088,0.865l-0.223,0.615l-0.378,0.75l-0.2,0.5l-0.246,0.546l-0.133,0.5v0.432l0.111,0.273l2.38-0.023 l1.135,0.069l0.823,0.113l0.49,0.159l0.288,0.319l0.424,0.523l0.156,0.454v0.319l-0.09,0.296l-0.2,0.227l-0.29,0.5l0.111,0.296 l0.223,0.409l0.201,0.204l0.111,0.364l-0.09,0.273l-0.267,0.296l-0.267,0.34l-0.111,0.364l0.088,0.319l0.157,0.363l0.11,0.342v0.25 l-0.11,0.363l-0.223,0.273l-0.313,0.296l-0.223,0.273l-0.088,0.273v0.319l0.023,0.409l-0.111,0.25l-0.313,0.342l-0.4,0.363 c0,0-0.156,0.137-0.378,0.25c-0.223,0.114-0.868,0.273-0.868,0.273l-0.846,0.091l-1.868-0.023l-1.937-0.091l-1.379-0.159 l-2.916-0.523L7.189,12.664z M3,13.986c0-0.939,0.761-1.7,1.702-1.7c0.939,0,1.702,0.762,1.702,1.7v4.596 c0,0.939-0.762,1.7-1.702,1.7C3.761,20.283,3,19.52,3,18.582V13.986z"/></g></svg>
									<span className="menu-link-text">{ this.translate( 'Recommendations' ) }</span>
								</a>
						</li> )
						: ( <li className={ this.itemLinkClass( '/recommendations', { 'sidebar-streams__recommendations': true } ) }>
							<a href="https://wordpress.com/recommendations/" rel="external">
								<Gridicon icon="star-outline" />
								<span className="menu-link-text">{ this.translate( 'Recommended Blogs' ) }</span>
							</a>
						</li> )
					}

						<li className={ this.itemLinkClass( '/activities/likes', { 'sidebar-activity__likes': true } ) }>
							<a href="/activities/likes">
								<Gridicon icon="star" size={ 24 } />
								<span className="menu-link-text">{ this.translate( 'My Likes' ) }</span>
							</a>
						</li>
					</ul>
				</li>

				<li className="sidebar-menu sidebar-dynamic-menu">
					<h2 className="sidebar-heading">{ this.translate( 'Lists' ) }</h2>
					<ul>
						{ this.renderLists() }

						<li className="sidebar-dynamic-menu__add" key="add-list">
							<input className="sidebar-dynamic-menu__add-input" type="text" placeholder={ this.translate( 'New List' ) } ref="addListInput" onKeyDown={ this.handleCreateListKeyDown } />
						</li>
					</ul>
				</li>

				<li className="sidebar-menu sidebar-dynamic-menu">
					<h2 className="sidebar-heading">{ this.translate( 'Tags' ) }</h2>
					<ul>
						{ this.renderTags() }
						<li className="sidebar-dynamic-menu__add" key="add-tag">
							<input className="sidebar-dynamic-menu__add-input" type="text" placeholder={ this.translate( 'Follow a Tag' ) } ref="addTagInput" onKeyDown={ this.handleFollowTagKeyDown } />
						</li>
					</ul>
				</li>
			</ul>
		);
	}
} );
