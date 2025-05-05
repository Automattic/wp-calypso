import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { formatNumber } from '@automattic/number-formatters';
import { Icon, moreHorizontalMobile, tag, file, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { Component } from 'react';
import titlecase from 'to-title-case';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { flagUrl } from 'calypso/lib/flags';
import { decodeEntities } from 'calypso/lib/formatting';
import { recordTrack } from 'calypso/reader/stats';
import Follow from './action-follow';
import OpenLink from './action-link';
import Page from './action-page';
import Promote from './action-promote';
import Spam from './action-spam';

const debug = debugFactory( 'calypso:stats:list-item' );

class StatsListItem extends Component {
	static displayName = 'StatsListItem';

	state = {
		active: this.props.active,
		actionMenuOpen: false,
		disabled: false,
		promoteWidgetOpen: false,
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

	getSiteIdForFollow = () => {
		return get( this.props, 'data.actions[0].data.blog_id' );
	};

	closeMenu = () => {
		this.removeMenuListener();
		this.setState( {
			actionMenuOpen: false,
		} );
	};

	actionMenuClick = ( event ) => {
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

	preventDefaultOnClick = ( event ) => {
		event.preventDefault();
	};

	onClick = ( event ) => {
		let gaEvent;
		const moduleName = titlecase( this.props.moduleName );

		if ( event.keyCode && event.keyCode !== 13 ) {
			return;
		}

		if ( this.state.promoteWidgetOpen ) {
			return;
		}

		debug( 'props', this.props );
		if ( ! this.state.disabled ) {
			if ( this.props.children ) {
				const moduleState = this.state.active ? 'Collapsed ' : 'Expanded ';
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
			} else if ( this.props.data.link && ! this.props.children && ! this.getSiteIdForFollow() ) {
				gaEvent = [ 'Clicked', moduleName, 'External Link' ].join( ' ' );

				window.open( this.props.data.link );
			} else if ( ! this.props.children ) {
				gaEvent = 'Clicked on ' + moduleName;
			}

			if ( gaEvent ) {
				gaRecordEvent( 'Stats', gaEvent + ' in List' );
			}
		}
	};

	spamHandler = ( isSpammed ) => {
		this.setState( {
			disabled: isSpammed,
		} );
	};

	buildActions = () => {
		let actionList;
		const data = this.props.data;
		const moduleName = titlecase( this.props.moduleName );
		const actionMenu = data.actionMenu;
		const actionClassSet = clsx( 'module-content-list-item-actions', {
			collapsed: actionMenu && ! this.state.disabled,
		} );

		const onTogglePromoteWidget = ( visible ) => {
			this.setState( {
				promoteWidgetOpen: visible,
			} );
		};

		// If we have more than a default action build out actions ul
		if ( data.actions ) {
			const actionItems = [];

			data.actions.forEach( function ( action ) {
				let actionItem;

				switch ( action.type ) {
					case 'follow':
						if ( action.data ) {
							actionItem = (
								<Follow
									key={ action.type }
									moduleName={ moduleName }
									isFollowing={ !! action.data.is_following }
									siteId={ action.data.blog_id }
								/>
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

			if ( this.props.moduleName === 'posts' && data.public ) {
				actionItems.push(
					<Promote
						postId={ data.id }
						key={ 'promote-post-' + data.id }
						moduleName={ moduleName }
						onToggleVisibility={ onTogglePromoteWidget }
					/>
				);
			}

			if ( actionItems.length > 0 ) {
				actionList = <ul className={ actionClassSet }>{ actionItems }</ul>;
			}
		}

		return actionList;
	};

	buildLabel = () => {
		const data = this.props.data;
		let labelData = data.label;

		if ( false === labelData instanceof Array ) {
			labelData = [ data ];
		}

		const wrapperClassSet = clsx( {
			'module-content-list-item-label-section': labelData.length > 1,
		} );
		const label = labelData.map( function ( labelItem, i ) {
			const iconClassSetOptions = { avatar: true };
			let icon;
			let gridiconSpan;
			let itemLabel;

			if ( labelItem.labelIcon ) {
				switch ( labelItem.labelIcon ) {
					case 'tag':
						gridiconSpan = <Icon className="stats-icon" icon={ tag } size={ 22 } />;
						break;
					case 'folder':
						gridiconSpan = <Icon className="stats-icon" icon={ file } size={ 22 } />;
						break;
					default:
						// fallback to an old icon
						gridiconSpan = <Gridicon icon={ labelItem.labelIcon } />;
				}
			}

			if ( labelItem.icon ) {
				if ( labelItem.iconClassName ) {
					iconClassSetOptions[ labelItem.iconClassName ] = true;
				}

				icon = (
					<span className="stats-list__icon">
						<img alt="" src={ labelItem.icon } className={ clsx( iconClassSetOptions ) } />
					</span>
				);
			}

			if ( labelItem.countryCode ) {
				const style = {
					backgroundImage: `url( ${ flagUrl( labelItem.countryCode.toLowerCase() ) } )`,
				};
				icon = <span className="stats-list__flag-icon" style={ style } />;
			}

			let labelText = labelItem.label;

			if ( this.props.useShortLabel && labelItem.shortLabel ) {
				labelText = labelItem.shortLabel;
			}

			if ( data.link ) {
				const href = data.link;
				let onClickHandler = this.preventDefaultOnClick;
				const siteId = this.getSiteIdForFollow();
				if ( this.isFollowersModule && siteId ) {
					onClickHandler = ( event ) => {
						const modifierPressed =
							event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
						recordTrack( 'calypso_reader_stats_module_site_stream_link_click', {
							site_id: siteId,
							module_name: this.props.moduleName,
							modifier_pressed: modifierPressed,
						} );

						if ( modifierPressed ) {
							return;
						}

						event.preventDefault();
						page( `/reader/blogs/${ siteId }` );
					};
				}

				itemLabel = (
					<a onClick={ onClickHandler } href={ href } title={ labelItem.linkTitle }>
						{ decodeEntities( labelText ) }
					</a>
				);
			} else {
				itemLabel = decodeEntities( labelText );
			}

			return (
				<span className={ wrapperClassSet } key={ i }>
					{ gridiconSpan }
					{ icon }
					{ itemLabel }{ ' ' }
				</span>
			);
		}, this );

		return label;
	};

	buildValue = () => {
		const data = this.props.data;
		let valueData = data.value;
		let value;

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
				value = formatNumber( valueData.value );
				break;
		}

		return value;
	};

	render() {
		const data = this.props.data;
		const rightClassOptions = {
			'module-content-list-item-right': true,
		};
		const toggleOptions = {
			'module-content-list-item-actions-toggle': true,
			show: data.actionMenu && ! this.state.disabled,
		};
		const actions = this.buildActions();
		const toggleGridicon = (
			<Icon className="stats-icon chevron-down" icon={ chevronDown } size={ 24 } />
		);
		const toggleIcon = this.props.children ? toggleGridicon : null;
		let mobileActionToggle;

		const groupClassOptions = {
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
				<button
					onClick={ this.actionMenuClick }
					className={ clsx( toggleOptions ) }
					title={ this.props.translate( 'Show Actions', {
						context: 'Label for hidden menu in a list on the Stats page.',
					} ) }
				>
					<Icon className="stats-icon" icon={ moreHorizontalMobile } size={ 22 } />
				</button>
			);
			rightClassOptions[ 'is-expanded' ] = this.state.actionMenuOpen;
		}

		const groupClassName = clsx( groupClassOptions );

		return (
			<li key={ this.key } data-group={ this.key } className={ groupClassName }>
				{ /* eslint-disable-next-line jsx-a11y/click-events-have-key-events */ }
				<span
					className="stats-list__module-content-list-item-wrapper"
					onClick={ this.onClick }
					onKeyUp={ this.onClick }
					tabIndex="0"
					role="button"
				>
					<span className={ clsx( rightClassOptions ) }>
						{ mobileActionToggle }
						{ actions }
						<span className="stats-list__module-content-list-item-value">
							{ data.value ? this.buildValue() : null }
						</span>
					</span>
					<span className="stats-list__module-content-list-item-label">
						{ toggleIcon }
						{ this.buildLabel() }
					</span>
				</span>
				{ this.props.children }
			</li>
		);
	}
}

export default localize( withLocalizedMoment( StatsListItem ) );
