/**
 * External dependencies
 */
var React = require( 'react' ),
	pick = require( 'lodash/pick' );

/**
 * Internal dependencies
 */
var Gridicon = require( 'components/gridicon' ),
	Slug = require( 'post-editor/editor-slug' ),
	Popover = require( 'components/popover' ),
	Tooltip = require( 'components/tooltip' ),
	ClipboardButton = require( 'components/forms/clipboard-button' );

var EditorPermalink = React.createClass( {

	propTypes: {
		path: React.PropTypes.string,
		slug: React.PropTypes.string,
		isEditable: React.PropTypes.bool
	},

	getInitialState: function() {
		return {
			showPopover: false,
			popoverVisible: false,
			showCopyConfirmation: false,
			tooltip: false
		};
	},

	componentDidUpdate: function( prevProps, prevState ) {
		if ( this.state.showPopover !== prevState.showPopover ) {
			// The contents of <Popover /> are only truly rendered into the
			// DOM after its `componentDidUpdate` finishes executing, so we
			// wait to render the clipboard button until after the update.
			this.setState( {
				popoverVisible: this.state.showPopover
			} );
		}
	},

	componentWillUnmount: function() {
		clearTimeout( this.dismissCopyConfirmation );
	},

	showPopover: function() {
		this.setState( {
			showPopover: ! this.state.showPopover,
			tooltip: false
		} );
	},

	showTooltip: function() {
		if ( ! this.state.showPopover ) {
			this.setState( { tooltip: true } );
		}
	},

	onCopy: function() {
		this.setState( {
			showCopyConfirmation: true
		} );

		clearTimeout( this.dismissCopyConfirmation );
		this.dismissCopyConfirmation = setTimeout( () => {
			this.setState( {
				showCopyConfirmation: false
			} );
		}, 4000 );
	},

	hideTooltip: function() {
		this.setState( { tooltip: false } );
	},

	closePopover: function() {
		this.setState( { showPopover: false } );
	},

	renderCopyButton: function() {
		var label;

		if ( ! this.state.popoverVisible ) {
			return;
		}

		if ( this.state.showCopyConfirmation ) {
			label = this.translate( 'Copied!' );
		} else {
			label = this.translate( 'Copy', { context: 'verb' } );
		}

		return (
			<ClipboardButton
				text={ this.props.path + this.props.slug }
				onCopy={ this.onCopy }
				compact>
				{ label }
			</ClipboardButton>
		)
	},

	render: function() {
		var tooltipMessage;

		if ( this.props.isEditable ) {
			tooltipMessage = this.translate( 'Edit post URL' );
		} else {
			tooltipMessage = this.translate( 'View post URL' );
		}

		return (
			<div className="editor-permalink" onMouseEnter={ this.showTooltip } onMouseLeave={ this.hideTooltip }>
				<Gridicon
					className="editor-permalink__toggle"
					icon="link"
					onClick={ this.showPopover }
					ref="popoverButton"
				/>
				<Popover
					isVisible={ this.state.showPopover }
					onClose={ this.closePopover }
					position={ 'bottom right' }
					context={ this.refs && this.refs.popoverButton }
					className="editor-permalink__popover"
				>
					<Slug
						{ ...pick( this.props, 'slug', 'path', 'isEditable' ) }
						onEscEnter={ this.closePopover }
						instanceName="post-popover"
					/>
					{ this.renderCopyButton() }
				</Popover>
				<Tooltip
					context={ this.refs && this.refs.popoverButton }
					isVisible={ this.state.tooltip }
					position="bottom"
				>
					{ tooltipMessage }
				</Tooltip>
			</div>
		);
	}
} );

module.exports = EditorPermalink;
