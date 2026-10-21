import { Icon, cloudDownload, external } from '@wordpress/icons';
import { Button } from '@wordpress/ui';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import EmotionCacheProvider from 'calypso/components/emotion-cache-provider';
import ActionList from 'calypso/dashboard/components/action-list';

import './style.scss';

class ThemeDownloadCard extends PureComponent {
	static propTypes = {
		href: PropTypes.string,
	};

	render() {
		const { href, translate } = this.props;

		const downloadText = translate(
			'This theme is available for download to be used on your {{a}}WordPress self-hosted{{icon/}}{{/a}} installation.',
			{
				components: {
					a: <a href="https://wordpress.org" target="_blank" rel="noreferrer" />,
					icon: (
						<Icon icon={ external } size={ 16 } className="theme-download-card__external-icon" />
					),
				},
			}
		);
		return (
			<EmotionCacheProvider>
				<div className="theme-download-card">
					<ActionList>
						<ActionList.ActionItem
							title={ translate( 'Download this theme' ) }
							description={ downloadText }
							actions={
								<Button
									nativeButton={ false }
									render={ <a href={ href } /> }
									size="compact"
									variant="outline"
								>
									<Button.Icon icon={ cloudDownload } />
									{ translate( 'Download' ) }
								</Button>
							}
						/>
					</ActionList>
				</div>
			</EmotionCacheProvider>
		);
	}
}

export default localize( ThemeDownloadCard );
