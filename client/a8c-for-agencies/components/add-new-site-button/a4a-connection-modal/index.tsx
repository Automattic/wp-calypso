import { Button } from '@automattic/components';
import { Icon, check, download, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import {
	A4A_DOWNLOAD_LINK_ON_GITHUB,
	A4A_PLUGIN_LINK_ON_WPORG,
} from 'calypso/a8c-for-agencies/constants';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import A4AThemedModal from '../../a4a-themed-modal';
import modalImage from './modal-image.png';

import './style.scss';

type Props = {
	onClose: () => void;
};

export default function A4AConnectionModal( { onClose }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onDownloadPlugin = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_add_site_via_a4a_plugin_modal_download_plugin_click' )
		);
		onClose?.();
	};

	const onLearnMore = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_add_site_via_a4a_plugin_modal_learn_more_click' ) );
		onClose?.();
	};

	return (
		<A4AThemedModal
			className="a4a-connection-modal"
			modalImage={ modalImage }
			onClose={ onClose }
			dismissable
		>
			<h1 className="a4a-connection-modal__title">
				{ translate( 'Download and install the Automattic for Agencies plugin to connect a site' ) }
			</h1>

			<p className="a4a-connection-modal__instruction">
				{ translate( 'Follow these steps to connect:' ) }

				<ul>
					<li>
						<Icon className="gridicon" icon={ check } size={ 24 } />{ ' ' }
						{ translate( 'Download and install the plugin on your client’s site.' ) }
					</li>
					<li>
						<Icon className="gridicon" icon={ check } size={ 24 } />
						{ translate( 'Click the {{b}}Connect site{{/b}} button on the plugin’s interface.', {
							components: {
								b: <b />,
							},
						} ) }
					</li>
					<li>
						<Icon className="gridicon" icon={ check } size={ 24 } />{ ' ' }
						{ translate( 'That’s it! See your client’s site in the dashboard.' ) }
					</li>
				</ul>
			</p>

			<div className="a4a-connection-modal__actions">
				<Button
					className="a4a-connection-modal__download-button"
					primary
					onClick={ onDownloadPlugin }
					href={ A4A_DOWNLOAD_LINK_ON_GITHUB }
					target="_blank"
					rel="noreferrer noopener"
				>
					{ translate( 'Download the plugin' ) }
					<Icon className="gridicon" icon={ download } />
				</Button>

				<Button
					className="a4a-connection-modal__learn-more-link"
					onClick={ onLearnMore }
					href={ A4A_PLUGIN_LINK_ON_WPORG }
					target="_blank"
					rel="noreferrer noopener"
					plain
				>
					<span>{ translate( 'Learn more' ) }</span>
					<Icon className="gridicon" icon={ external } size={ 18 } />
				</Button>
			</div>
		</A4AThemedModal>
	);
}
