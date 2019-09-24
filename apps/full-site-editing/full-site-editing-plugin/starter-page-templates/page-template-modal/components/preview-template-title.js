/**
 * Return a component which acts as a PostTitle,
 * applying the css classes needed to follow the styles
 * inherited from the Editor.
 *
 * @param {string} title Template title - transform css rule.
 * @return {*} Component
 */

const PreviewTemplateTitle = ( { title } ) => (
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	<div className="editor-post-title">
		<div className="editor-post-title__block">
			<textarea className="editor-post-title__input" value={ title } />
		</div>
	</div>
	/* eslint-enable wpcalypso/jsx-classname-namespace */
);

export default PreviewTemplateTitle;
