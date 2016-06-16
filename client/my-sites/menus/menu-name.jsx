/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:menus:menu' ); // eslint-disable-line no-unused-vars

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' );

var MenuName = React.createClass( {

	getInitialState: function() {
		return {
			editing: false,
			value: this.props.value
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		this.setState( { value: nextProps.value } );
	},

	toggleEdit: function() {
		var editing = this.state.editing;

		if ( ! editing ) {
			analytics.ga.recordEvent( 'Menus', 'Clicked Edit Menu Title' );
		}

		const newEditingState = ! editing;
		this.setState( { editing: newEditingState } );
		if ( this.props.onTitleEdit ) {
			this.props.onTitleEdit( newEditingState );
		}
	},

	updateName: function( newValue ) {
		this.setState( {
			value: newValue,
			editing: false
		} );
		if ( this.props.onChange ) {
			this.props.onChange( newValue );
		}

		if ( this.props.onTitleEdit ) {
			this.props.onTitleEdit( false );
		}
	},

	render: function() {
		var menuEditable;

		if ( this.state.editing ) {
			menuEditable = (
				<TemporaryInput
					value={ this.state.value }
					className={ this.props.className }
					onEdited={ this.updateName } />
			);
		} else {
			menuEditable = (
				<span className={ this.props.className } onTouchTap={ this.toggleEdit }>
					<span>{ this.state.value }</span>
					<a className="edit" />
				</span>
			);
		}

		return menuEditable;
	}

} );

var TemporaryInput = React.createClass( {

	getInitialState: function() {
		return {
			value: this.props.value
		};
	},

	componentDidMount: function() {
		var node = ReactDom.findDOMNode( this.refs.input );
		node.focus();
		try {
			node.setSelectionRange( 0, 999 );
		} catch ( e ) {
			debug( 'setSelectionRange failed' );
		}
	},

	updateValue: function( event ) {
		this.setState( { value: event.target.value } );
	},

	maybeFinishEditing: function( event ) {
		if ( 13 === event.which ) {
			this.finishEditing();
		}
	},

	finishEditing: function() {
		this.props.onEdited( this.state.value );
	},

	render: function() {
		return (
			<input
				ref="input"
				type="text"
				className={ this.props.className }
				onChange={ this.updateValue }
				onKeyPress={ this.maybeFinishEditing }
				onBlur={ this.finishEditing }
				value={ this.state.value } />
		);
	}
} );

module.exports = MenuName;
