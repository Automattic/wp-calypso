import { localize } from 'i18n-calypso';
import SharingButtonsPreviewButtons from '../preview-buttons';
import './style.scss';

const buttons = [
	{ ID: 'facebook', name: 'Facebook', shortname: 'facebook' },
	{ ID: 'reddit', name: 'Reddit', shortname: 'reddit' },
	{ ID: 'tumblr', name: 'Tumblr', shortname: 'tumblr' },
	{ ID: 'pinterest', name: 'Pinterest', shortname: 'pinterest' },
];

const ButtonsBlockAppearance = ( { translate } ) => {
	return (
		<>
			<div className="sharing-buttons__panel sharing-buttons-appearance">
				<p className="sharing-buttons-appearance__description">
					{ translate(
						'Allow readers to easily share your posts with others by adding sharing buttons throughout your site.'
					) }
				</p>
				<div className="sharing-buttons__buttons-wrapper">
					<button className="button is-primary sharing-buttons__button-site-editor">
						{ translate( 'Go to the Site Editor' ) }
					</button>

					<button className="button sharing-buttons__button-learn-more">
						{ translate( 'Learn how to add Sharing Buttons' ) }
					</button>
				</div>
				<p className="sharing-buttons__example-text">{ translate( 'Sharing Buttons example:' ) }</p>
				<SharingButtonsPreviewButtons buttons={ buttons } style="icon-text" />
			</div>
		</>
	);
};

export default localize( ButtonsBlockAppearance );
