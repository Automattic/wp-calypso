/** @format */
/**
 * External dependencies
 */
import wp from 'wp';
const { Component } = wp.element;
const { Button, Dashicon } = wp.components;
const { RichText } = wp.editor;

export const ItemEditor = class extends Component {
	constructor() {
		super( ...arguments );
		this.toggleDone = this.toggleDone.bind( this );
		this.updateValue = this.updateValue.bind( this );
		this.onSetup = this.onSetup.bind( this );
		this.editor = undefined;
	}

	componentWillReceiveProps( newProps ) {
		if ( newProps.autoFocus && ! this.props.autoFocus ) {
			window.requestAnimationFrame( () => {
				this.editor.focus();
			} );
		}
	}

	toggleDone() {
		const { item } = this.props;
		item.done = ! item.done;
		this.props.onChange( item );
	}

	updateValue( newValue ) {
		const { item } = this.props;
		item.value = newValue;
		this.props.onChange( item );
	}

	onSetup( editor ) {
		const { autoFocus } = this.props;
		this.editor = editor;
		if ( autoFocus ) {
			window.requestAnimationFrame( () => {
				this.editor.focus();
			} );
		}
	}

	render() {
		const {
			item,
			moveUp,
			moveDown,
			moveLeft,
			moveRight,
			canMoveUp,
			canMoveDown,
			classNames,
			onChange,
			autoFocus,
			onDelete,
		} = this.props;
		const { done, value } = item;
		return (
			<li className={ classNames }>
				<span className="item-status" onClick={ this.toggleDone }>
					{ done && <Dashicon icon="yes" /> }
				</span>
				{ /* { 0 < item.level && <Button onClick={ moveLeft }>&lt;</Button> }
				{ 2 > item.level && <Button onClick={ moveRight }>&gt;</Button> }
				{ '-'.repeat( item.level ) }  */ }
				<span className="item-title">
					<RichText
						tagName="div"
						value={ value }
						onChange={ this.updateValue }
						multiline={ false }
						onSplit={ this.props.onSplit }
						onSetup={ this.onSetup }
					/>
				</span>
				<span className="move-buttons">
					{ canMoveUp && (
						<Button onClick={ moveUp }>
							<Dashicon icon="arrow-up-alt2" />
						</Button>
					) }
					{ canMoveDown && (
						<Button onClick={ moveDown }>
							<Dashicon icon="arrow-down-alt2" />
						</Button>
					) }
					<Button onClick={ onDelete }>
						<Dashicon icon="no" />
					</Button>
				</span>
			</li>
		);
	}
};
