import React from 'react';
import ReactDOM from 'react-dom';
import tinymce from 'tinymce/tinymce';
import { Provider } from 'react-redux';

const menuItemPlugin = props => editor => {
	let node;
	const store = editor.getParam( 'redux_store' );
	const { commandName, Wizard } = props;
	const focusEditor = () => editor.focus();
	const updateContent = newContent => editor.execCommand( 'mceInsertContent', false, newContent );

	editor.on( 'init', () => {
		node = editor.getContainer().appendChild(
			document.createElement( 'div' )
		);
	} );

	editor.on( 'remove', () => {
		ReactDOM.unmountComponentAtNode( node );
		node.parentNode.removeChild( node );
		node = null;
	} );

	editor.addCommand( commandName, content => {
		ReactDOM.render(
			<Provider store={ store }>
				<Wizard
					content={ content }
					onClose={ focusEditor }
					onUpdateContent={ updateContent }
				/>
			</Provider>,
			node
		);
	} );
};

export default props => () => {
	tinymce.PluginManager.add( props.pluginSlug, menuItemPlugin( props ) );
}
