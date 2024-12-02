import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import ExternalLink from 'calypso/components/external-link';
import { PanelCard } from 'calypso/components/panel';
import { useSelector } from 'calypso/state';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import SharingButtonsPreviewButtons from '../preview-buttons';

import './style.scss';

const buttons = [
	{ ID: 'facebook', name: 'Facebook', shortname: 'facebook' },
	{ ID: 'reddit', name: 'Reddit', shortname: 'reddit' },
	{ ID: 'tumblr', name: 'Tumblr', shortname: 'tumblr' },
	{ ID: 'pinterest', name: 'Pinterest', shortname: 'pinterest' },
];

const ButtonsBlockAppearance = ( { isJetpack, translate, siteId } ) => {
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const siteEditorUrl = siteAdminUrl + 'site-editor.php?path=%2Fwp_template';
	const supportDocLink = localizeUrl(
		isJetpack
			? 'https://jetpack.com/support/jetpack-blocks/sharing-buttons-block/'
			: 'https://wordpress.com/support/wordpress-editor/blocks/sharing-buttons-block/'
	);

	return (
		<PanelCard>
			<p className="sharing-buttons-appearance__description">
				{ translate(
					'Allow readers to easily share your posts with others by adding a sharing buttons block anywhere in one of your site’s templates.'
				) }
			</p>
			<div className="sharing-buttons__buttons-wrapper">
				<a className="button is-primary" href={ siteEditorUrl }>
					{ translate( 'Go to the Site Editor' ) }
				</a>

				<ExternalLink className="button" href={ supportDocLink } icon>
					{ translate( 'Learn how to add Sharing Buttons' ) }
				</ExternalLink>
			</div>
			<p className="sharing-buttons__example-text">{ translate( 'Sharing Buttons example:' ) }</p>
			<SharingButtonsPreviewButtons buttons={ buttons } style="icon-text" />
		</PanelCard>
	);
};

export default localize( ButtonsBlockAppearance );
