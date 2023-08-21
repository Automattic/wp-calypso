import classnames from 'classnames';

const ImporterActionButtonContainer = ( { justifyContentCenter = false, children } ) =>
	children ? (
		<div
			className={ classnames( 'importer-action-buttons__container', {
				'is-justify-content-center': justifyContentCenter,
			} ) }
		>
			{ children }
		</div>
	) : null;

ImporterActionButtonContainer.displayName = 'ImporterActionButtonContainer';

export default ImporterActionButtonContainer;
