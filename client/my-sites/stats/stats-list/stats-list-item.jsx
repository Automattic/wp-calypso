/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:stats:list-item' );
import page from 'page';

/**
 * Internal dependencies
 */
import Follow from './action-follow';
import Page from './action-page';
import OpenLink from './action-link';
import Spam from './action-spam';
import Emojify from 'client/components/emojify';
import titlecase from 'to-title-case';
import analytics from 'client/lib/analytics';
import Gridicon from 'gridicons';
import { get } from 'lodash';
import { recordTrack } from 'client/reader/stats';

class StatsListItem extends React.Component {
	static displayName = 'StatsListItem';

	state = {
		active: this.props.active,
		actionMenuOpen: false,
		disabled: false,
	};

	addMenuListener = () => {
		document.addEventListener( 'click', this.closeMenu );
	};

	removeMenuListener = () => {
		document.removeEventListener( 'click', this.closeMenu );
	};

	componentWillUnmount() {
		if ( this.props.data.actionMenu ) {
			this.removeMenuListener();
		}
	}

	isFollowersModule = () => {
		return !! this.props.followList;
	};

	getSiteIdForFollow = () => {
		return get( this.props, 'data.actions[0].data.blog_id' );
	};

	closeMenu = () => {
		this.removeMenuListener();
		this.setState( {
			actionMenuOpen: false,
		} );
	};

	actionMenuClick = event => {
		event.stopPropagation();
		event.preventDefault();

		if ( ! this.state.actionMenuOpen ) {
			this.addMenuListener();
			this.setState( {
				actionMenuOpen: true,
			} );
		} else {
			this.closeMenu();
		}
	};

	preventDefaultOnClick = event => {
		event.preventDefault();
	};

	onClick = event => {
		var gaEvent,
			moduleName = titlecase( this.props.moduleName );

		debug( 'props', this.props );
		if ( ! this.state.disabled ) {
			if ( this.props.children ) {
				var moduleState = this.state.active ? 'Collapsed ' : 'Expanded ';
				gaEvent = moduleState + moduleName;

				this.setState( {
					active: ! this.state.active,
				} );
			}

			if ( 'function' === typeof this.props.itemClickHandler ) {
				event.stopPropagation();
				this.props.itemClickHandler( event, this.props.data );
			} else if ( this.props.data.page && ! this.props.children ) {
				gaEvent = [ 'Clicked', moduleName, 'Summary Link' ].join( ' ' );
				page( this.props.data.page );
			} else if (
				this.props.data.link &&
				! this.props.children &&
				! ( this.isFollowersModule() && this.getSiteIdForFollow() )
			) {
				gaEvent = [ 'Clicked', moduleName, 'External Link' ].join( ' ' );

				window.open( this.props.data.link );
			} else if ( ! this.props.children ) {
				gaEvent = 'Clicked on ' + moduleName;
			}

			if ( gaEvent ) {
				analytics.ga.recordEvent( 'Stats', gaEvent + ' in List' );
			}
		}
	};

	spamHandler = isSpammed => {
		this.setState( {
			disabled: isSpammed,
		} );
	};

	buildActions = () => {
		var data = this.props.data,
			moduleName = titlecase( this.props.moduleName ),
			actionMenu = data.actionMenu,
			actionClassSet = classNames( 'module-content-list-item-actions', {
				collapsed: actionMenu && ! this.state.disabled,
			} ),
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
							actionItem = (
								<Follow followSite={ followSite } key={ action.type } moduleName={ moduleName } />
							);
						}
						break;
					case 'page':
						actionItem = (
							<Page page={ action.page } key={ action.type } moduleName={ moduleName } />
						);
						break;
					case 'spam':
						actionItem = (
							<Spam
								data={ action.data }
								key={ action.type }
								afterChange={ this.spamHandler }
								moduleName={ moduleName }
							/>
						);
						break;
					case 'link':
						actionItem = (
							<OpenLink href={ action.data } key={ action.type } moduleName={ moduleName } />
						);
						break;
				}

				if ( actionItem ) {
					actionItems.push( actionItem );
				}
			}, this );

			if ( actionItems.length > 0 ) {
				actionList = <ul className={ actionClassSet }>{ actionItems }</ul>;
			}
		}

		return actionList;
	};

	buildLabel = () => {
		var data = this.props.data,
			labelData = data.label,
			wrapperClassSet,
			label;

		if ( false === labelData instanceof Array ) {
			labelData = [ data ];
		}

		wrapperClassSet = classNames( {
			'module-content-list-item-label-section': labelData.length > 1,
		} );

		label = labelData.map( function( labelItem, i ) {
			var iconClassSetOptions = { avatar: true },
				icon,
				gridiconSpan,
				itemLabel;

			if ( labelItem.labelIcon ) {
				gridiconSpan = <Gridicon icon={ labelItem.labelIcon } />;
			}

			if ( labelItem.icon ) {
				if ( labelItem.iconClassName ) {
					iconClassSetOptions[ labelItem.iconClassName ] = true;
				}

				icon = (
					<span className="icon">
						<img alt="" src={ labelItem.icon } className={ classNames( iconClassSetOptions ) } />
					</span>
				);
			}

			if ( labelItem.backgroundImage ) {
				const style = { backgroundImage: `url( ${ labelItem.backgroundImage } )` };
				icon = <span className="stats-list__flag-icon" style={ style } />;
			}

			if ( data.link ) {
				const href = data.link;
				let onClickHandler = this.preventDefaultOnClick;
				const siteId = this.getSiteIdForFollow();
				if ( this.isFollowersModule && siteId ) {
					onClickHandler = event => {
						const modifierPressed =
							event.button > 0 ||
							event.metaKey ||
							event.controlKey ||
							event.shiftKey ||
							event.altKey;
						recordTrack( 'calypso_reader_stats_module_site_stream_link_click', {
							siteId,
							module_name: this.props.moduleName,
							modifier_pressed: modifierPressed,
						} );

						if ( modifierPressed ) {
							return;
						}

						event.preventDefault();
						page( `/read/blogs/${ siteId }` );
					};
				}
				itemLabel = (
					<a onClick={ onClickHandler } href={ href }>
						{ labelItem.label }
					</a>
				);
			} else {
				itemLabel = <Emojify>{ labelItem.label }</Emojify>;
			}

			return (
				<span className={ wrapperClassSet } key={ i }>
					{ gridiconSpan }
					{ icon }
					{ itemLabel }{' '}
				</span>
			);
		}, this );

		return label;
	};

	buildValue = () => {
		var data = this.props.data,
			valueData = data.value,
			value;

		if ( 'object' !== typeof valueData || ! valueData.type ) {
			valueData = {
				type: 'number',
				value: valueData,
			};
		}

		switch ( valueData.type ) {
			case 'relative-date':
				value = this.props.moment( valueData.value ).fromNow( true );
				break;
			default:
			case 'number':
				value = this.props.numberFormat( valueData.value );
				break;
		}

		return value;
	};

	render() {
		var data = this.props.data,
			rightClassOptions = {
				'module-content-list-item-right': true,
			},
			toggleOptions = {
				'module-content-list-item-actions-toggle': true,
				show: data.actionMenu && ! this.state.disabled,
			},
			actions = this.buildActions(),
			toggleGridicon = <Gridicon icon="chevron-down" />,
			toggleIcon = this.props.children ? toggleGridicon : null,
			mobileActionToggle,
			groupClassOptions,
			groupClassName;

		groupClassOptions = {
			'module-content-list-item': true,
			disabled: this.state.disabled,
			'module-content-list-item-link': this.props.children || data.link || data.page,
			'module-content-list-item-toggle': this.props.children,
			'is-expanded': this.state.active,
		};

		if ( data.className ) {
			groupClassOptions[ data.className ] = true;
		}

		if ( actions ) {
			mobileActionToggle = (
				<a
					href="#"
					onClick={ this.actionMenuClick }
					className={ classNames( toggleOptions ) }
					title={ this.props.translate( 'Show Actions', {
						context: 'Label for hidden menu in a list on the Stats page.',
					} ) }
				>
					<Gridicon icon="ellipsis" />
				</a>
			);
			rightClassOptions[ 'is-expanded' ] = this.state.actionMenuOpen;
		}

		groupClassName = classNames( groupClassOptions );

		return (
			<li key={ this.key } data-group={ this.key } className={ groupClassName }>
				<span className="module-content-list-item-wrapper" onClick={ this.onClick } tabIndex="0">
					<span className={ classNames( rightClassOptions ) }>
						{ mobileActionToggle }
						{ actions }
						<span className="module-content-list-item-value">
							{ data.value ? this.buildValue() : null }
						</span>
					</span>
					<span className="module-content-list-item-label">
						{ toggleIcon }
						{ this.buildLabel() }
					</span>
				</span>
				{ this.props.children }
			</li>
		);
	}
}

export default localize( StatsListItem );
