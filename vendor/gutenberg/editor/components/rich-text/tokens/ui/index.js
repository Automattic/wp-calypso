/**
 * WordPress dependencies
 */
import { Component, Fragment, renderToString } from '@wordpress/element';
import { getRectangleFromRange } from '@wordpress/dom';
import { __ } from '@wordpress/i18n';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';
import { InserterResultsPortal } from '../../../inserter';

class TokenUI extends Component {
	constructor() {
		super( ...arguments );

		this.onHover = this.onHover.bind( this );
		this.onSelect = this.onSelect.bind( this );
		this.onSave = this.onSave.bind( this );

		this.state = {
			selected: null,
			hovered: null,
		};
	}

	getInsertPosition() {
		const { containerRef, editor } = this.props;

		// The container is relatively positioned.
		const containerPosition = containerRef.current.getBoundingClientRect();
		const rect = getRectangleFromRange( editor.selection.getRng() );

		return {
			top: rect.top - containerPosition.top,
			left: rect.right - containerPosition.left,
			height: rect.height,
		};
	}

	onSave( { save } ) {
		return ( attributes ) => {
			const { editor } = this.props;

			if ( attributes ) {
				editor.insertContent( renderToString( save( attributes ) ) );
			}

			this.setState( { selected: null } );
		};
	}

	onHover( settings ) {
		this.setState( { hovered: !! settings } );
	}

	onSelect( settings ) {
		this.setState( { selected: settings } );
	}

	render() {
		const { hovered, selected } = this.state;

		return (
			<Fragment>
				<InserterResultsPortal
					title={ __( 'Inline Elements' ) }
					items={ this.props.items }
					onSelect={ this.onSelect }
					onHover={ this.onHover }
				/>
				{ hovered &&
					<div
						style={ { position: 'absolute', ...this.getInsertPosition() } }
						className="blocks-inline-insertion-point"
					/>
				}
				{ selected &&
					<selected.edit onSave={ this.onSave( selected ) } />
				}
			</Fragment>
		);
	}
}

export default withSelect( ( select ) => {
	const { getTokenSettings } = select( 'core/editor' );

	return {
		items: Object.values( getTokenSettings() ),
	};
} )( TokenUI );
