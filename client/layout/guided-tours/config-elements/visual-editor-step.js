/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getPreference } from 'state/preferences/selectors';
import Step from './step';

export class VisualEditorStep extends Step {
	componentDidMount() {
		super.componentDidMount();
		this.interval = setInterval( () => {
			this.onScrollOrResize();
		}, 2000 );
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		clearInterval( this.interval );
	}

	render() {
		if ( this.props.isEditorModeVisual ) {
			return super.render();
		}
		return null;
	}
}

export default connect( state => ( {
	isEditorModeVisual: 'tinymce' === getPreference( state, 'editor-mode' ),
} ) )( VisualEditorStep );
