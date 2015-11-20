/**
 * External dependencies
 */
import React from 'react/addons';
import page from 'page';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import config from 'config';
import Gridicon from 'components/gridicon';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';

/**
 * Module variables
 */
const isSwitcherEnabled = config.isEnabled( 'post-editor/post-type-switch' );

export default React.createClass( {

	displayName: 'EditorPostType',

	mixins: [ React.addons.PureRenderMixin ],

	getDefaultProps() {
		return {
			isNew: false,
			type: 'post'
		};
	},

	propTypes: {
		isNew: React.PropTypes.bool,
		type: React.PropTypes.string,
		siteSlug: React.PropTypes.string
	},

	getInitialState() {
		return {
			showMenu: false
		};
	},

	toggleMenu() {
		if ( isSwitcherEnabled ) {
			this.setState( { showMenu: ! this.state.showMenu } );
		}
	},

	startNew( type ) {
		this.setState( { showMenu: false } );
		page( '/' + type + '/' + this.props.siteSlug );
	},

	getLabel() {
		const { type, isNew } = this.props;

		if ( isNew ) {
			if ( type === 'page') {
				return this.translate( 'New Page' );
			} else {
				return this.translate( 'New Post' );
			}
		} else {
			if ( type === 'page' ) {
				return this.translate( 'Page', { context: 'noun' } );
			} else {
				return this.translate( 'Post', { context: 'noun' } );
			}
		}
	},

	render() {
		const classes = classNames( 'editor-post-type', {
			'is-switcher-enabled': isSwitcherEnabled
		} );

		return (
			<span className={ classes } ref="postType" onClick={ this.toggleMenu }>
				{ this.getLabel() }
				{ isSwitcherEnabled && (
					<Gridicon icon="chevron-down" size={ 16 } />
				) }
				{ isSwitcherEnabled && (
					<PopoverMenu
						className="popover editor-post-type__menu"
						isVisible={ this.state.showMenu }
						onClose={ this.toggleMenu }
						position={ 'bottom' }
						context={ this.refs && this.refs.postType }
					>
						<PopoverMenuItem onClick={ this.startNew.bind( this, 'post' ) }>
							<Gridicon icon="posts" size={ 18 } />
							{ this.translate( 'Start a new post' ) }
						</PopoverMenuItem>
						<PopoverMenuItem onClick={ this.startNew.bind( this, 'page' ) }>
							<Gridicon icon="pages" size={ 18 } />
							{ this.translate( 'Start a new page' ) }
						</PopoverMenuItem>
					</PopoverMenu>
				) }
			</span>
		);
	}
} );
