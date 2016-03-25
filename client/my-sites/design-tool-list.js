/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

const ControlButton = props => (
	<div onClick={ props.onClick } className="design-menu-controls__control-button">
		<span className="design-menu-controls__control-button__title">{ props.title }</span>
		<Gridicon icon="chevron-right" size={ 24 } className="design-menu-controls__control-button__arrow" />
	</div>
);

const DesignToolList = React.createClass( {
	propTypes: {
		activateControl: React.PropTypes.func.isRequired,
		controls: React.PropTypes.arrayOf( React.PropTypes.shape( {
			id: React.PropTypes.string.isRequired,
			title: React.PropTypes.string.isRequired,
		} ) ),
	},

	renderAllControls() {
		return this.props.controls.map( this.renderControl );
	},

	renderControl( control ) {
		const activateControl = () => this.props.activateControl( control.id );
		return <ControlButton key={ control.id } title={ control.title } onClick={ activateControl } />;
	},

	render() {
		return (
			<div className="design-menu-controls__control-list">
				{ this.renderAllControls() }
			</div>
		);
	}
} );

export default DesignToolList;
