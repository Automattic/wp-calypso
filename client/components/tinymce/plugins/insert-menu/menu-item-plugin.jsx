import React from 'react';
import ReactDOM from 'react-dom';
import tinymce from 'tinymce/tinymce';
import { Provider } from 'react-redux';

const menuItemPlugin = props => editor => {
	let node;
	const store = editor.getParam( 'redux_store' );
	const {
		Wizard,
		buttonName,
		commandName,
	} = props;

	const focusEditor = () => editor.focus();
	const updateContent = newContent => editor.execCommand( 'mceInsertContent', false, newContent );

	const closeWizard = () => {
		if ( ! node ) {
			return focusEditor();
		}

		ReactDOM.unmountComponentAtNode( node );
		node.parentNode.removeChild( node );
		node = null;

		focusEditor();
	};

	const openWizard = () => {
		node = editor.getContainer().appendChild(
			document.createElement( 'div' )
		);

		ReactDOM.render(
			<Provider store={ store }>
				<Wizard
					content={ editor.getContent() }
					onClose={ closeWizard }
					onUpdateContent={ updateContent }
				/>
			</Provider>,
			node
		);
	};

	editor.on( 'remove', closeWizard );

	editor.addCommand( commandName, openWizard );

	editor.addButton( buttonName, {
		cmd: commandName,
		title: 'Button',
		icon: 'unlink'
	} );
};

export default props => () => {
	tinymce.PluginManager.add( props.pluginSlug, menuItemPlugin( props ) );
};
