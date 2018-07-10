/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Button from '../button';
import Dashicon from '../dashicon';

class PanelBody extends Component {
	constructor( props ) {
		super( ...arguments );
		this.state = {
			opened: props.initialOpen === undefined ? true : props.initialOpen,
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
		const { title, children, opened, className, icon } = this.props;
		const isOpened = opened === undefined ? this.state.opened : opened;
		const arrow = `arrow-${ isOpened ? 'up' : 'down' }`;
		const classes = classnames( 'components-panel__body', className, { 'is-opened': isOpened } );

		return (
			<div className={ classes }>
				{ !! title && (
					<h2 className="components-panel__body-title">
						<Button
							className="components-panel__body-toggle"
							onClick={ this.toggle }
							aria-expanded={ isOpened }
						>
							<Dashicon icon={ arrow } className="components-panel__arrow" />
							{ icon && <Dashicon icon={ icon } className="components-panel__icon" /> }
							{ title }
						</Button>
					</h2>
				) }
				{ isOpened && children }
			</div>
		);
	}
}

export default PanelBody;
