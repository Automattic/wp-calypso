/**
 * Return a component which acts as a PostTitle,
 * applying the css classes needed to follow ths styles
 * inherited from the theme.
 *
 * @param {string} title Template title
 * @return {*} Component
 */
export default ( { title } ) => (
	<div className="editor-post-content">
		<div className="editor-post-title">
			<div className="editor-post-title__block">
				<textarea className="editor-post-title__input" value={ title } />
			</div>
		</div>
	</div>
);
