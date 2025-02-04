import { Button, Card, Gridicon } from '@automattic/components';
import { Icon, external } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

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
			<Card className="theme-download-card">
				<Gridicon icon="cloud-download" size={ 48 } />
				<p>{ downloadText }</p>
				<Button href={ href }>{ translate( 'Download' ) }</Button>
			</Card>
		);
	}
}

export default localize( ThemeDownloadCard );
