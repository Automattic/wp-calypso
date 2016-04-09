/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import EditorPublishButton from 'post-editor/editor-publish-button';
import Button from 'components/button';

const EditorMobileNavigation = React.createClass( {

	propTypes: {
		site: PropTypes.object,
		post: PropTypes.object,
		savedPost: PropTypes.object,
		onSave: PropTypes.func,
		onPublish: PropTypes.func,
		tabIndex: PropTypes.number,
		isPublishing: PropTypes.bool,
		isSaveBlocked: PropTypes.bool,
		hasContent: PropTypes.bool,
		onClose: PropTypes.func
	},

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
					<Button borderless onClick={ this.props.onClose }>
						<Gridicon
							icon="chevron-left"
							className="editor-mobile-navigation__icon" />
					</Button>
					<div className="editor-mobile-navigation__tabs">
						<Button borderless onClick={ this.closeSidebar }>
							<Gridicon
								icon="pencil"
								className={ classnames( 'editor-mobile-navigation__icon', {
									'is-selected': ! this.state.sidebarOpen
								} ) } />
						</Button>
						<Button borderless onClick={ this.openSidebar }>
							<Gridicon
								icon="cog"
								className={ classnames( 'editor-mobile-navigation__icon', {
									'is-selected': this.state.sidebarOpen
								} ) } />
						</Button>
					</div>
				</div>
				<EditorPublishButton
					site={ this.props.site }
					post={ this.props.post }
					savedPost={ this.props.savedPost }
					onSave={ this.props.onSave }
					onPublish={ this.props.onPublish }
					isPublishing={ this.props.isPublishing }
					isSaveBlocked={ this.props.isSaveBlocked }
					hasContent={ this.props.hasContent }
				/>
			</div>
		);
	}
} );

module.exports = connect( null, { setLayoutFocus } )( EditorMobileNavigation );
