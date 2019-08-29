/**
 * Return a component which acts as a PostTitle,
 * applying the css classes needed to follow ths styles
 * inherited from the theme.
 *
 * @param {string} title Template title - transform css rule.
 * @return {*} Component
 */

const PreviewTemplateTitle = ( { title, transform } ) => (
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	<div className="editor-post-content">
		<div className="editor-post-title">
			<div className="editor-post-title__block">
				<textarea style={ { transform } } className="editor-post-title__input" value={ title } />
			</div>
		</div>
	</div>
	/* eslint-enable wpcalypso/jsx-classname-namespace */
);

export default PreviewTemplateTitle;
