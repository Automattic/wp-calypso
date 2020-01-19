/**
 * Return a component which acts as a PostTitle,
 * applying the css classes needed to follow the styles
 * inherited from the Editor.
 *
 * @param {object} props Component props.
 * @param {string} props.title Template title - transform css rule.
 * @param {number} props.scale Scale transform based upon the preview viewport width.
 * @returns {*} Component
 */

const PreviewTemplateTitle = ( { title, scale } ) => (
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	<div className="editor-post-title" style={ { transform: `scale(${ scale })` } }>
		<div className="wp-block editor-post-title__block">
			<textarea className="editor-post-title__input" value={ title } onChange={ () => {} } />
		</div>
	</div>
	/* eslint-enable wpcalypso/jsx-classname-namespace */
);

export default PreviewTemplateTitle;
