/**
 * External dependencies
 */
const assign = require( 'lodash/object/assign' ),
	classnames = require( 'classnames' ),
	closest = require( 'component-closest' ),
	map = require( 'lodash/collection/map' ),
	some = require( 'lodash/collection/some' ),
	startsWith = require( 'lodash/string/startsWith' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	page = require( 'page' ),
	url = require( 'url' ),
	last = require( 'lodash/array/last' ),
	classNames = require( 'classnames' );

/**
 * Internal Dependencies
 */
const layoutFocus = require( 'lib/layout-focus' ),
	Tags = require( 'lib/reader-tags/subscriptions' ),
	TagActions = require( 'lib/reader-tags/actions' ),
	ReaderListsSubscriptionsStore = require( 'lib/reader-lists/subscriptions' ),
	ReaderListsStore = require( 'lib/reader-lists/lists' ),
	ReaderListActions = require( 'lib/reader-lists/actions' ),
	ReaderTeams = require( 'lib/reader-teams' ),
	Sidebar = require( 'layout/sidebar' ),
	SidebarActions = require( 'lib/reader-sidebar/actions' ),
	SidebarHeading = require( 'layout/sidebar/heading' ),
	SidebarMenu = require( 'layout/sidebar/menu' ),
	stats = require( 'reader/stats' ),
	Gridicon = require( 'components/gridicon' ),
	config = require( 'config' ),
	discoverHelper = require( 'reader/discover/helper' ),
	Button = require( 'components/button' ),
	Count = require( 'components/count' ),
	config = require( 'config' ),
	SidebarMenu = require( './menu' );

module.exports = React.createClass( {
	displayName: 'ReaderSidebar',

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
		ReaderListsStore.on( 'change', this.updateState );
		ReaderListsSubscriptionsStore.on( 'change', this.updateState );
		ReaderListsSubscriptionsStore.on( 'create', this.highlightNewList );
		ReaderTeams.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		Tags.off( 'change', this.updateState );
		Tags.off( 'add', this.highlightNewTag );
		ReaderListsStore.off( 'change', this.updateState );
		ReaderListsSubscriptionsStore.off( 'change', this.updateState );
		ReaderListsSubscriptionsStore.off( 'create', this.highlightNewList );
		ReaderTeams.off( 'change', this.updateState );
	},

	getInitialState: function() {
		//return this.getStateFromStores();
		return assign(
			{ isListsToggled: false },
			{ isTagsToggled: false },
			{ isListsAddOpen: false },
			{ isTagsAddOpen: false },
			this.getStateFromStores()
		);
	},

	getStateFromStores: function() {
		const tags = Tags.get();
		const lists = ReaderListsSubscriptionsStore.get();
		const teams = ReaderTeams.get();

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
			stats.recordTrack( 'calypso_reader_reader_tag_followed', {
				tag: tag
			} );
		}
	},

	unfollowTag: function( event ) {
		var node = closest( event.target, '[data-tag-slug]', true );
		event.preventDefault();
		if ( node && node.dataset.tagSlug ) {
			stats.recordAction( 'unfollowed_topic' );
			stats.recordGaEvent( 'Clicked Unfollow Topic', node.dataset.tagSlug );
			stats.recordTrack( 'calypso_reader_reader_tag_unfollowed', {
				tag: node.dataset.tagSlug
			} );
			TagActions.unfollow( { slug: node.dataset.tagSlug } );
		}
	},

	highlightNewList: function( list ) {
		list = ReaderListsStore.get( list.owner, list.slug );
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
				listRelativeUrl + '/tags',
				listRelativeUrl + '/edit',
				listRelativeUrl + '/sites',
			];

			const lastPathSegment = last( this.props.path.split( '/' ) );
			const isCurrentList = lastPathSegment && lastPathSegment.toLowerCase() === list.slug.toLowerCase() && this.pathStartsWithOneOf( [ listRelativeUrl ] );
			const isActionButtonSelected = this.pathStartsWithOneOf( listManagementUrls );

			const classes = classnames(
				this.itemLinkClassStartsWithOneOf( [ listRelativeUrl ], { 'sidebar-menu__item has-buttons': true } ),
				{
					'sidebar-dynamic-menu__list has-buttons': true,
					selected: isCurrentList || isActionButtonSelected,
					'is-action-button-selected': isActionButtonSelected
				}
			);

			return (
				<li className={ classes } key={ list.ID } >
					<a className="sidebar-menu__item-label" href={ list.URL }>{ list.title }</a>
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
				<li className={ this.itemLinkClass( '/tag/' + tag.slug, { 'sidebar-menu__item': true } ) } key={ tag.ID } >
					<a className="sidebar-menu__item-label" href={ tag.URL }>
						{ tag.display_name || tag.slug }
					</a>
					{ tag.ID !== 'pending' ? <button className="sidebar-menu__action" data-tag-slug={ tag.slug } onClick={ this.unfollowTag }>
						<Gridicon icon="cross-small" />
						<span className="sidebar-menu__action-label">{ this.translate( 'Unfollow' ) }</span>
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

	toggleMenuLists: function( event ) {
		this.setState( {
			isListsToggled: ! this.state.isListsToggled
		} );
	},

	toggleListsAdd: function( event ) {
		this.setState( {
			isListsAddOpen: ! this.state.isListsAddOpen
		} );

		if ( ! this.state.isListsAddOpen ) {
			this.refs.addListInput.getDOMNode().focus();
		}
	},

	disableListsAdd: function( event ) {
		this.setState( {
			isListsAddOpen: false
		} );
	},

	toggleMenuTags: function( event ) {
		this.setState( {
			isTagsToggled: ! this.state.isTagsToggled
		} );
	},

	toggleTagsAdd: function( event ) {
		this.setState( {
			isTagsAddOpen: ! this.state.isTagsAddOpen
		} );

		if ( ! this.state.isTagsAddOpen ) {
			this.refs.addTagInput.getDOMNode().focus();
		}
	},

	disableTagsAdd: function( event ) {
		this.setState( {
			isTagsAddOpen: false
		} );
	},

	renderEmptyList: function() {
		return(
			<li className="sidebar-menu__empty">{ this.translate( 'Collect sites together by adding a\xa0list.' ) }</li>
		);
	},

	renderEmptyTags: function() {
		return(
			<li className="sidebar-menu__empty">{ this.translate( 'Finds relevant posts by adding a\xa0tag.' ) }</li>
		);
	},

	render: function() {
		let followingEditLink = this.getFollowingEditLink();

		var listsClassNames = classNames( {
				'sidebar-menu': true,
				'is-dynamic': true,
				'is-togglable': true,
				'is-toggle-open': this.state.isListsToggled,
				'is-add-open': this.state.isListsAddOpen
			} ),
			tagsClassNames = classNames( {
				'sidebar-menu': true,
				'is-dynamic': true,
				'is-togglable': true,
				'is-toggle-open': this.state.isTagsToggled,
				'is-add-open': this.state.isTagsAddOpen
			} ),
			isTags = false,
			isLists = false,
			tagCount = 0,
			listCount = 0;

		if ( typeof this.state.tags !== 'undefined' && this.state.tags !== null && this.state.tags.length > 0 ) {
			isTags = true;
			tagCount = this.state.tags.length;
		}

		if ( typeof this.state.lists !== 'undefined' && this.state.lists !== null && this.state.lists.length > 0 ) {
			isLists = true;
			listCount = this.state.lists.length;
		}

		console.log( listCount, tagCount );

		return (
			<Sidebar onClick={ this.handleClick }>
				<SidebarMenu>
					<SidebarHeading>{ this.translate( 'Streams' ) }</SidebarHeading>
					<ul>
						<li className={ this.itemLinkClass( '/', { 'sidebar-streams__following': true } ) }>
							<a href="/">
								<Gridicon icon="checkmark-circle" size={ 24 } />
								<span className="menu-link-text">{ this.translate( 'Followed Sites' ) }</span>
							</a>
							<a href="/following/edit" className="add-new">{ this.translate( 'Manage' ) }</a>
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
				</SidebarMenu>

				<li className={ listsClassNames }>
					<h2 className="sidebar-heading" onClick={ this.toggleMenuLists }>
						<Gridicon icon="chevron-down" />
						<span>{ this.translate( 'Lists' ) }</span>
						{ isLists
							? <Count count={ listCount } />
							: null
						}
					</h2>

					<Button compact className="sidebar-menu__add-button" onClick={ this.toggleListsAdd }>Add</Button>

					<div className="sidebar-menu__add" key="add-list">
						<input
							className="sidebar-menu__add-input"
							type="text"
							placeholder={ this.translate( 'Give your list a name' ) }
							ref="addListInput"
							onKeyDown={ this.handleCreateListKeyDown }
						/>
						<Gridicon icon="cross-small" onClick={ this.disableListsAdd } />
					</div>

					<ul className="sidebar-menu__list">
						{
							// There's got to be a better way to do this...
							// - we could check the list count in renderLists, then render
							// the empty list message if it's zero?
							isLists
							? this.renderLists()
							: this.renderEmptyList()
						}
					</ul>

					<SidebarMenu title={ this.translate( 'Lists' ) } count={ listCount }>
						{ this.renderLists() }
					</SidebarMenu>
				</li>

				<li className={ tagsClassNames }>
					<h2 className="sidebar-heading" onClick={ this.toggleMenuTags }>
						<Gridicon icon="chevron-down" />
						{ this.translate( 'Tags' ) }
						{ isTags
							? <Count count={ tagCount } />
							: null
						}
					</h2>

					<Button compact className="sidebar-menu__add-button" onClick={ this.toggleTagsAdd }>Add</Button>

					<div className="sidebar-menu__add" key="add-tag">
						<input
							className="sidebar-menu__add-input"
							type="text"
							placeholder={ this.translate( 'Add any tag' ) }
							ref="addTagInput"
							onKeyDown={ this.handleFollowTagKeyDown }
						/>
						<Gridicon icon="cross-small" onClick={ this.disableTagsAdd } />
					</div>

					<ul className="sidebar-menu__list">
						{
							// There's got to be a better way to do this...
							isTags
							? this.renderTags()
							: this.renderEmptyTags()
						}
					</ul>
				</li>
			</Sidebar>
		);
	}
} );
