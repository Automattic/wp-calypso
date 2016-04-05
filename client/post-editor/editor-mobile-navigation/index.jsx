/**
 * External dependencies
 */
<<<<<<< 429330de20f54078095263b712a5032d91979d7a
import React from 'react';
import { connect } from 'react-redux';
=======
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
>>>>>>> Moved the primary button to the navigation bar, only in mobile
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
<<<<<<< 429330de20f54078095263b712a5032d91979d7a
import { setLayoutFocus } from 'state/ui/layout-focus/actions';

const EditorMobileNavigation = React.createClass( {
=======
import layoutFocus from 'lib/layout-focus';
import EditorPublishButton from 'post-editor/editor-publish-button';

export default React.createClass( {
	displayName: 'EditorMobileNavigation',

	propTypes: {
		site: PropTypes.object,
		post: PropTypes.object,
		savedPost: PropTypes.object,
		onSave: PropTypes.function,
		onPublish: PropTypes.function,
		tabIndex: PropTypes.number,
		isPublishing: PropTypes.bool,
		isSaveBlocked: PropTypes.bool,
		hasContent: PropTypes.bool,
		onClose: PropTypes.function
	},

	mixins: [ PureRenderMixin ],
>>>>>>> Moved the primary button to the navigation bar, only in mobile

	getInitialState: function() {
		return {
			sidebarOpen: false
		};
	},

	openSidebar: function() {
		if ( ! this.state.sidebarOpen ) {
			this.props.setLayoutFocus( 'sidebar' );
			this.setState( { sidebarOpen: true } );
		}
	},

	closeSidebar: function() {
		if ( this.state.sidebarOpen ) {
			this.props.setLayoutFocus( 'content' );
			this.setState( { sidebarOpen: false } );
		}
	},

	render: function() {
		if ( ! this.props.site ) {
			return null;
		}

		return (
			<div className="editor-mobile-navigation">
				<div className="editor-mobile-navigation__actions">
					<Gridicon
						icon="chevron-left"
						onClick={ this.props.onClose }
						className="editor-mobile-navigation__icon separator-right" />
					<Gridicon
						icon="pencil"
						onClick={ this.closeSidebar }
						className={ classnames( 'editor-mobile-navigation__icon', {
							'is-selected': ! this.state.sidebarOpen
						} ) } />
					<Gridicon
						icon="cog"
						onClick={ this.openSidebar }
						className={ classnames( 'editor-mobile-navigation__icon', 'separator-right', {
							'is-selected': this.state.sidebarOpen
						} ) } />
				</div>
				<EditorPublishButton { ...this.props } />
			</div>
		);
	}
} );

module.exports = connect( null, { setLayoutFocus } )( EditorMobileNavigation );
