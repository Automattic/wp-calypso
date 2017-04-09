/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:stats:list-item' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
var Follow = require( './action-follow' ),
	Page = require( './action-page' ),
	OpenLink = require( './action-link' ),
	Spam = require( './action-spam' ),
	Emojify = require( 'components/emojify' ),
	titlecase = require( 'to-title-case' ),
	analytics = require( 'lib/analytics' ),
	Gridicon = require( 'gridicons' );

module.exports = React.createClass( {
	displayName: 'StatsListItem',

	getInitialState: function() {
		return {
			active: this.props.active,
			actionMenuOpen: false,
			disabled: false
		};
	},

	addMenuListener: function() {
		document.addEventListener( 'click', this.closeMenu );
	},

	removeMenuListener: function() {
		document.removeEventListener( 'click', this.closeMenu );
	},

	componentWillUnmount: function() {
		if ( this.props.data.actionMenu ) {
			this.removeMenuListener();
		}
	},

	closeMenu: function() {
		this.removeMenuListener();
		this.setState( {
			actionMenuOpen: false
		} );
	},

	actionMenuClick: function( event ) {
		event.stopPropagation();
		event.preventDefault();

		if ( ! this.state.actionMenuOpen ) {
			this.addMenuListener();
			this.setState( {
				actionMenuOpen: true
			} );
		} else {
			this.closeMenu();
		}
	},

	onClick: function( event ) {
		var gaEvent,
			moduleName = titlecase( this.props.moduleName );

		debug( 'props', this.props );
		if ( ! this.state.disabled ) {
			if ( this.props.children ) {
				var moduleState = this.state.active ? 'Collapsed ' : 'Expanded ';
				gaEvent = moduleState + moduleName;

				this.setState( {
					active: ! this.state.active
				} );
			}

			if ( 'function' === typeof this.props.itemClickHandler ) {
				event.stopPropagation();
				this.props.itemClickHandler( event, this.props.data );
			} else if ( this.props.data.page && ! this.props.children ) {
				gaEvent = [ 'Clicked', moduleName, 'Summary Link' ].join( ' ' );
				page( this.props.data.page );
			} else if ( this.props.data.link && ! this.props.children ) {
				gaEvent = [ 'Clicked', moduleName, 'External Link' ].join( ' ' );

				window.open( this.props.data.link );
			} else if ( ! this.props.children ) {
				gaEvent = 'Clicked on ' + moduleName;
			}

			if ( gaEvent ) {
				analytics.ga.recordEvent( 'Stats', gaEvent + ' in List' );
			}
		}
	},

	spamHandler: function( isSpammed ) {
		this.setState( {
			disabled: isSpammed
		} );
	},

	buildActions: function() {
		var data = this.props.data,
			moduleName = titlecase( this.props.moduleName ),
			actionMenu = data.actionMenu,
			actionClassSet = classNames(
				'module-content-list-item-actions',
				{ collapsed: actionMenu && ! this.state.disabled }
			),
			actionList;

		// If we have more than a default action build out actions ul
		if ( data.actions ) {
			var actionItems = [];

			data.actions.forEach( function( action ) {
				var actionItem;

				switch ( action.type ) {
					case 'follow':
						if ( action.data && this.props.followList ) {
							var followSite = this.props.followList.add( action.data );
							actionItem = <Follow followSite={ followSite } key={ action.type } moduleName={ moduleName } />;
						}
						break;
					case 'page':
						actionItem = <Page page={ action.page } key={ action.type } moduleName={ moduleName } />;
						break;
					case 'spam':
						actionItem = <Spam data={ action.data } key={ action.type } afterChange={ this.spamHandler } moduleName={ moduleName } />;
						break;
					case 'link':
						actionItem = <OpenLink href={ action.data } key={ action.type } moduleName={ moduleName } />;
						break;
				}

				if ( actionItem ) {
					actionItems.push( actionItem );
				}
			}, this );

			if ( actionItems.length > 0 ) {
				actionList = ( <ul className={ actionClassSet }>{ actionItems }</ul> );
			}
		}

		return actionList;
	},

	buildLabel: function() {
		var data = this.props.data,
			labelData = data.label,
			wrapperClassSet,
			label;

		if ( false === labelData instanceof Array ) {
			labelData = [ data ];
		}

		wrapperClassSet = classNames( { 'module-content-list-item-label-section': labelData.length > 1 } );

		label = labelData.map( function( labelItem, i ) {
			var iconClassSetOptions = { avatar: true },
				icon,
				gridiconSpan;

			if ( labelItem.labelIcon ) {
				gridiconSpan = ( <Gridicon icon={ labelItem.labelIcon } /> );
			}

			if ( labelItem.icon ) {
				if ( labelItem.iconClassName ) {
					iconClassSetOptions[ labelItem.iconClassName ] = true;
				}

				icon = (
					<span className='icon'>
						<img alt="" src={ labelItem.icon } className={ classNames( iconClassSetOptions ) } />
					</span>
				);
			}

			if ( labelItem.backgroundImage ) {
				const style = { backgroundImage: `url( ${ labelItem.backgroundImage } )` };
				icon = ( <span className="stats-list__flag-icon" style={ style } /> );
			}

			return ( <span className={ wrapperClassSet } key={ i } >{ gridiconSpan }{ icon }<Emojify>{ labelItem.label }</Emojify></span> );
		}, this );

		return label;
	},

	buildValue: function() {
		var data = this.props.data,
			valueData = data.value,
			value;

		if ( 'object' !== typeof valueData || ! valueData.type ) {
			valueData = {
				type: 'number',
				value: valueData
			};
		}

		switch ( valueData.type ) {
			case 'relative-date':
				value = this.moment( valueData.value ).fromNow( true );
				break;
			default:
			case 'number':
				value = this.numberFormat( valueData.value );
				break;
		}

		return value;
	},

	render: function() {
		var data = this.props.data,
			rightClassOptions = {
				'module-content-list-item-right': true
			},
			toggleOptions = {
				'module-content-list-item-actions-toggle': true,
				show: data.actionMenu && ! this.state.disabled
			},
			actions = this.buildActions(),
			toggleGridicon = ( <Gridicon icon="chevron-down" /> ),
			toggleIcon = this.props.children ? toggleGridicon : null,
			mobileActionToggle,
			groupClassOptions,
			groupClassName;

		groupClassOptions = {
			'module-content-list-item': true,
			disabled: this.state.disabled,
			'module-content-list-item-link': this.props.children || data.link || data.page,
			'module-content-list-item-toggle': this.props.children,
			'is-expanded': this.state.active
		};

		if ( data.className ) {
			groupClassOptions[ data.className ] = true;
		}

		if ( actions ) {
			mobileActionToggle = (
				<a
					href="#"
					onClick={ this.actionMenuClick }
					className={
						classNames( toggleOptions )
					}
					title={
						this.translate(
							'Show Actions',
							{ context: 'Label for hidden menu in a list on the Stats page.' }
						)
					}
				>
					<Gridicon icon="ellipsis" />
				</a>
			);
			rightClassOptions[ 'is-expanded' ] = this.state.actionMenuOpen;
		}

		groupClassName = classNames( groupClassOptions );

		return (
			<li key={ this.key } data-group={ this.key } className={ groupClassName }>
				<span className='module-content-list-item-wrapper' onClick={ this.onClick } tabIndex="0">
					<span className={ classNames( rightClassOptions ) }>
						{ mobileActionToggle }
						{ actions }
						<span className="module-content-list-item-value">{ data.value ? this.buildValue() : null }</span>
					</span>
					<span className="module-content-list-item-label">{ toggleIcon }{ this.buildLabel() }</span>
				</span>
				{ this.props.children }
			</li>
		);
	}
} );
