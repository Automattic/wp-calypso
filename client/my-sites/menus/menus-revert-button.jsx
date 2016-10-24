/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const debug = debugFactory( 'calypso:menus:revert-button' ); // eslint-disable-line no-unused-vars

const MenuRevertButton = React.createClass( {
	componentWillMount() {
		this.props.menuData.on( 'saved', this.endReverting );
		this.props.menuData.on( 'error', this.endReverting );
		this.props.menuData.on( 'saving', this.disable );
	},

	componentWillUnmount() {
		this.props.menuData.off( 'saved', this.endReverting );
		this.props.menuData.off( 'error', this.endReverting );
		this.props.menuData.off( 'saving', this.disable );
	},

	getInitialState() {
		return {
			reverting: false,
			disabled: false
		};
	},

	startReverting() {
		this.setState( {
			reverting: true,
			disabled: true
		} );
	},

	endReverting() {
		this.setState( {
			reverting: false,
			disabled: false
		} );
	},

	disable() {
		this.setState( { disabled: true } );
	},

	revert() {
		this.startReverting();
		return this.props.menuData.discard();
	},

	render() {
		const { hasChanged } = this.props.menuData.get();
		const disabled = this.state.disabled || ! hasChanged;

		return (
			<Button disabled={ disabled }
					onClick={ this.revert }>
				{ this.state.reverting ? this.translate( 'Canceling…' ) : this.translate( 'Cancel' ) }
			</Button>
		);
	}
} );

export default MenuRevertButton;
