/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { Button, Dashicon, Panel, PanelHeader } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './style.scss';

class MetaBoxesPanel extends Component {
	constructor( props ) {
		super( ...arguments );
		this.state = {
			opened: props.initialOpen === undefined ? false : props.initialOpen,
		};
		this.toggle = this.toggle.bind( this );
	}

	toggle( event ) {
		event.preventDefault();
		if ( this.props.opened === undefined ) {
			this.setState( ( state ) => ( {
				opened: ! state.opened,
			} ) );
		}

		if ( this.props.onToggle ) {
			this.props.onToggle();
		}
	}

	render() {
		const { children, opened } = this.props;
		const isOpened = opened === undefined ? this.state.opened : opened;
		const icon = `arrow-${ isOpened ? 'down' : 'right' }`;
		const className = classnames( 'edit-post-meta-boxes-panel__body', { 'is-opened': isOpened } );

		return (
			<Panel className="edit-post-meta-boxes-panel">
				<Button
					onClick={ this.toggle }
					aria-expanded={ isOpened }
					className="edit-post-meta-boxes-panel__toggle"
				>
					<PanelHeader>
						{ __( 'Extended Settings' ) }
						<Dashicon icon={ icon } />
					</PanelHeader>
				</Button>
				<div className={ className }>{ children }</div>
			</Panel>
		);
	}
}

export default MetaBoxesPanel;
